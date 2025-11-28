# SPARQL Query Examples for Deepfake Notary

This document provides SPARQL query examples for querying the Decentralized Knowledge Graph (DKG) through OriginTrail.

## Table of Contents
- [Basic Queries](#basic-queries)
- [Filtering by Score](#filtering-by-score)
- [Guardian Reputation](#guardian-reputation)
- [Temporal Queries](#temporal-queries)
- [Advanced Analytics](#advanced-analytics)

## Prerequisites

All Knowledge Assets published to the DKG follow the Schema.org MediaReview vocabulary and use JSON-LD format. When queried through SPARQL, these assets can be filtered, aggregated, and analyzed.

## Basic Queries

### 1. Find All Fact-Checks

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating .
  ?rating schema:ratingValue ?score .
}
LIMIT 100
```

### 2. Get Fact-Check Details

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score ?confidence ?model ?analyzedAt
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score ;
          schema:confidenceScore ?confidence .

  OPTIONAL {
    ?factCheck schema:datePublished ?analyzedAt .
  }
}
ORDER BY DESC(?confidence)
LIMIT 50
```

## Filtering by Score

### 3. Find High-Confidence Deepfakes

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score ?confidence
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score ;
          schema:confidenceScore ?confidence .

  # Deepfake score > 0.8 and confidence > 0.85
  FILTER(?score > 0.8 && ?confidence > 0.85)
}
ORDER BY DESC(?score)
```

### 4. Find Likely Authentic Media

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score ?confidence
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score ;
          schema:confidenceScore ?confidence .

  # Low deepfake score = likely authentic
  FILTER(?score < 0.3 && ?confidence > 0.7)
}
ORDER BY ?score
```

### 5. Filter by Media Hash

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score ?hash
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score .

  ?factCheck schema:associatedMedia ?media .
  ?media schema:sha256 ?hash .

  # Replace with actual hash
  FILTER(?hash = "abc123...")
}
```

## Guardian Reputation

### 6. Find Top Guardians by Reputation

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?guardian ?reputation ?verificationCount ?accuracy
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:author ?author .

  ?author a schema:Person ;
          schema:identifier ?guardian .

  # Assuming custom properties for reputation
  OPTIONAL { ?author schema:aggregateRating ?rating .
             ?rating schema:ratingValue ?reputation . }
}
GROUP BY ?guardian ?reputation ?verificationCount ?accuracy
HAVING (COUNT(?factCheck) > 5)
ORDER BY DESC(?reputation)
LIMIT 20
```

### 7. Find Fact-Checks by Specific Guardian

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?claim ?score ?analyzedAt
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating ;
             schema:author ?author .

  ?rating schema:ratingValue ?score .
  ?author schema:identifier "guardian:eth:0x1234..." .

  OPTIONAL { ?factCheck schema:datePublished ?analyzedAt . }
}
ORDER BY DESC(?analyzedAt)
```

## Temporal Queries

### 8. Recent Fact-Checks (Last 24 Hours)

```sparql
PREFIX schema: <https://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?factCheck ?claim ?score ?analyzedAt
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating ;
             schema:datePublished ?analyzedAt .

  ?rating schema:ratingValue ?score .

  # Filter for last 24 hours
  FILTER(?analyzedAt > "2024-01-01T00:00:00Z"^^xsd:dateTime)
}
ORDER BY DESC(?analyzedAt)
```

### 9. Fact-Checks by Date Range

```sparql
PREFIX schema: <https://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?factCheck ?claim ?score ?analyzedAt
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:claimReviewed ?claim ;
             schema:reviewRating ?rating ;
             schema:datePublished ?analyzedAt .

  ?rating schema:ratingValue ?score .

  # Specify date range
  FILTER(?analyzedAt >= "2024-01-01T00:00:00Z"^^xsd:dateTime &&
         ?analyzedAt <= "2024-12-31T23:59:59Z"^^xsd:dateTime)
}
ORDER BY ?analyzedAt
```

## Advanced Analytics

### 10. Average Deepfake Score by Model

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?model (AVG(?score) AS ?avgScore) (COUNT(?factCheck) AS ?count)
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score .

  # Assuming model info in provenance
  OPTIONAL { ?factCheck schema:provider ?provider .
             ?provider schema:name ?model . }
}
GROUP BY ?model
HAVING (?count > 10)
ORDER BY DESC(?avgScore)
```

### 11. Consensus Analysis

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?mediaHash (COUNT(?factCheck) AS ?reviews)
       (AVG(?score) AS ?avgScore) (STDEV(?score) AS ?scoreVariance)
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating ?rating ;
             schema:associatedMedia ?media .

  ?rating schema:ratingValue ?score .
  ?media schema:sha256 ?mediaHash .
}
GROUP BY ?mediaHash
HAVING (COUNT(?factCheck) > 3)
ORDER BY DESC(?reviews)
```

### 12. Detection Artifact Frequency

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?artifact (COUNT(?artifact) AS ?frequency)
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating ?rating .

  ?rating schema:ratingValue ?score .

  # Assuming artifacts stored as keywords
  ?factCheck schema:keywords ?artifact .

  FILTER(?score > 0.7)
}
GROUP BY ?artifact
ORDER BY DESC(?frequency)
LIMIT 10
```

## Using with DKG Service

### Example: Query via DKG Service

```typescript
import { dkgService } from './services/dkg.service';

// Example SPARQL query
const query = `
  PREFIX schema: <https://schema.org/>

  SELECT ?factCheck ?score ?confidence
  WHERE {
    ?factCheck a schema:MediaReview ;
               schema:reviewRating ?rating .
    ?rating schema:ratingValue ?score ;
            schema:confidenceScore ?confidence .
    FILTER(?score > 0.8)
  }
  LIMIT 10
`;

// Execute query
const results = await dkgService.query(query);
console.log('High-confidence deepfakes:', results);
```

### Example: Query via MCP Server

```typescript
// Using the MCP server's query_dkg tool
const mcpResult = await mcpServer.callTool('query_dkg', {
  sparqlQuery: `
    PREFIX schema: <https://schema.org/>
    SELECT ?factCheck ?score
    WHERE {
      ?factCheck a schema:MediaReview ;
                 schema:reviewRating/schema:ratingValue ?score .
      FILTER(?score > 0.9)
    }
  `,
  limit: 20
});
```

## Tips and Best Practices

1. **Use LIMIT**: Always use LIMIT to prevent overwhelming the DKG node
2. **Index by Hash**: Media hashes (SHA-256) are the best way to find specific media
3. **Filter Efficiently**: Put the most selective filters first
4. **Aggregate Carefully**: Use HAVING to filter aggregated results
5. **Handle Optionals**: Use OPTIONAL for properties that may not exist
6. **Date Filtering**: Use xsd:dateTime for temporal queries
7. **Pagination**: Use LIMIT and OFFSET for large result sets

## Error Handling

```typescript
try {
  const results = await dkgService.query(sparqlQuery);

  if (!results || results.length === 0) {
    console.log('No results found');
  } else {
    console.log(`Found ${results.length} results`);
  }
} catch (error) {
  console.error('SPARQL query failed:', error);
  // Handle error appropriately
}
```

## Additional Resources

- [OriginTrail DKG Documentation](https://docs.origintrail.io)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [Schema.org MediaReview](https://schema.org/MediaReview)
- [JSON-LD Best Practices](https://json-ld.org/spec/latest/json-ld-api-best-practices/)
