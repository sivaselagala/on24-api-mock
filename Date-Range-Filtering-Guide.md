# Date Range Filtering - Registrants API Guide

## Overview
The `/registrants` endpoint now supports date range filtering based on the `lastactivity` field. You can filter registrants who had activity within a specific date range.

## Date Filter Parameters

| Parameter | Format | Description | Required |
|-----------|--------|-------------|----------|
| startDate | ISO 8601 DateTime | Start of date range (inclusive) | No |
| endDate | ISO 8601 DateTime | End of date range (inclusive) | No |

## Date Format

Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`

**Examples:**
- `2026-02-19T01:31:42`
- `2026-02-20T23:59:59`
- `2022-06-15T00:00:00`

**Note:** The timezone offset from the data is respected during comparison.

## How It Works

The filter compares the `lastactivity` field of each registrant:
- **startDate**: Include registrants with `lastactivity >= startDate`
- **endDate**: Include registrants with `lastactivity <= endDate`
- **Both**: Include registrants with `lastactivity` between startDate and endDate (inclusive)

## Sample Data for Testing

The API now includes registrants with these `lastactivity` dates:

| Name | Last Activity | Event ID |
|------|---------------|----------|
| Johnson Tsai | 2022-06-15T23:52:31-07:00 | 3631282 |
| Johnson Tsai | 2022-06-15T23:51:19-07:00 | 3631283 |
| Sarah Chen | 2022-06-16T10:15:22-07:00 | 3631284 |
| Michael Brown | 2022-06-17T08:30:45-07:00 | 3631282 |
| Lisa Wang | 2026-02-19T14:30:00-07:00 | 3631285 |
| David Martinez | 2026-02-20T09:15:00-07:00 | 3631286 |
| Emily Thompson | 2026-02-18T16:45:00-07:00 | 3631282 |
| Robert Kim | 2026-02-21T11:30:00-07:00 | 3631283 |

## Usage Examples

### Example 1: Filter by Start Date Only

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-19T00:00:00
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 3,
  "registrants": [
    { "firstname": "Lisa", "lastactivity": "2026-02-19T14:30:00-07:00", ... },
    { "firstname": "David", "lastactivity": "2026-02-20T09:15:00-07:00", ... },
    { "firstname": "Robert", "lastactivity": "2026-02-21T11:30:00-07:00", ... }
  ]
}
```

**Explanation:**
- Returns all registrants with lastactivity on or after Feb 19, 2026
- Total: 3 registrants (Lisa, David, Robert)

### Example 2: Filter by End Date Only

**Request:**
```
GET https://your-app.onrender.com/registrants?endDate=2022-06-16T23:59:59
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 3,
  "registrants": [
    { "firstname": "Johnson", "lastactivity": "2022-06-15T23:52:31-07:00", ... },
    { "firstname": "Johnson", "lastactivity": "2022-06-15T23:51:19-07:00", ... },
    { "firstname": "Sarah", "lastactivity": "2022-06-16T10:15:22-07:00", ... }
  ]
}
```

**Explanation:**
- Returns all registrants with lastactivity on or before June 16, 2022
- Total: 3 registrants

### Example 3: Filter by Date Range (Both Start and End)

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-19T01:31:42&endDate=2026-02-20T01:31:42
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 1,
  "registrants": [
    {
      "firstname": "Lisa",
      "lastname": "Wang",
      "email": "lisa.wang@tech.com",
      "lastactivity": "2026-02-19T14:30:00-07:00",
      "eventid": 3631285,
      ...
    }
  ]
}
```

**Explanation:**
- Start: Feb 19, 2026 01:31:42
- End: Feb 20, 2026 01:31:42
- Lisa's activity (Feb 19 14:30) falls within this range
- David's activity (Feb 20 09:15) is AFTER the end date, so excluded

### Example 4: Date Range + Event Filter

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2022-06-15T00:00:00&endDate=2022-06-17T23:59:59&eventid=3631282
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 2,
  "registrants": [
    { "firstname": "Johnson", "eventid": 3631282, "lastactivity": "2022-06-15T23:52:31-07:00", ... },
    { "firstname": "Michael", "eventid": 3631282, "lastactivity": "2022-06-17T08:30:45-07:00", ... }
  ]
}
```

**Explanation:**
- Filters by date range AND event ID
- Returns only registrants for event 3631282 within the date range

### Example 5: Date Range + Pagination

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-18T00:00:00&endDate=2026-02-21T23:59:59&pagenumber=0&pagesize=2
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 2,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Lisa", "lastactivity": "2026-02-19T14:30:00-07:00", ... },
    { "firstname": "David", "lastactivity": "2026-02-20T09:15:00-07:00", ... }
  ]
}
```

**Explanation:**
- Total: 4 registrants in date range
- Page size: 2
- Page count: 2
- Returns first 2 registrants

### Example 6: Date Range + Multiple Filters + Sort

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-18T00:00:00&endDate=2026-02-21T23:59:59&country=USA&_sort=lastactivity&_order=desc
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Robert", "lastactivity": "2026-02-21T11:30:00-07:00", ... },
    { "firstname": "David", "lastactivity": "2026-02-20T09:15:00-07:00", ... },
    { "firstname": "Lisa", "lastactivity": "2026-02-19T14:30:00-07:00", ... },
    { "firstname": "Emily", "lastactivity": "2026-02-18T16:45:00-07:00", ... }
  ]
}
```

**Explanation:**
- Filters by date range AND country
- Sorted by lastactivity in descending order (newest first)

### Example 7: Get Today's Activity

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-19T00:00:00&endDate=2026-02-19T23:59:59
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 1,
  "registrants": [
    { "firstname": "Lisa", "lastactivity": "2026-02-19T14:30:00-07:00", ... }
  ]
}
```

**Explanation:**
- Returns registrants active only on Feb 19, 2026

### Example 8: Last 7 Days Activity

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-14T00:00:00&endDate=2026-02-21T23:59:59
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Emily", "lastactivity": "2026-02-18T16:45:00-07:00", ... },
    { "firstname": "Lisa", "lastactivity": "2026-02-19T14:30:00-07:00", ... },
    { "firstname": "David", "lastactivity": "2026-02-20T09:15:00-07:00", ... },
    { "firstname": "Robert", "lastactivity": "2026-02-21T11:30:00-07:00", ... }
  ]
}
```

### Example 9: No Results in Date Range

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 0,
  "registrants": []
}
```

**Explanation:**
- No registrants have activity in 2025
- Returns empty array

### Example 10: Invalid Date Range (Page Out of Bounds)

**Request:**
```
GET https://your-app.onrender.com/registrants?startDate=2026-02-19T00:00:00&endDate=2026-02-19T23:59:59&pagenumber=5&pagesize=2
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 0."
}
```

**Explanation:**
- Only 1 registrant in date range
- Page size: 2
- Page count: 1 (only page 0 is valid)
- Requesting page 5 is invalid

## Testing with cURL

### Basic date range
```bash
curl "https://your-app.onrender.com/registrants?startDate=2026-02-19T00:00:00&endDate=2026-02-20T23:59:59"
```

### Date range with URL encoding
```bash
curl "https://your-app.onrender.com/registrants?startDate=2026-02-19T01%3A31%3A42&endDate=2026-02-20T01%3A31%3A42"
```

### Date range + event filter
```bash
curl "https://your-app.onrender.com/registrants?startDate=2022-06-15T00:00:00&endDate=2022-06-17T23:59:59&eventid=3631282"
```

### Date range + pagination
```bash
curl "https://your-app.onrender.com/registrants?startDate=2026-02-18T00:00:00&endDate=2026-02-21T23:59:59&pagenumber=0&pagesize=2"
```

## Testing with JavaScript

```javascript
// Get registrants active in a date range
const startDate = '2026-02-19T01:31:42';
const endDate = '2026-02-20T01:31:42';

fetch(`https://your-app.onrender.com/registrants?startDate=${startDate}&endDate=${endDate}`)
  .then(res => res.json())
  .then(data => {
    console.log('Total Registrants:', data.totalregistrants);
    console.log('Registrants:', data.registrants);
  });

// Date range with additional filters
const params = new URLSearchParams({
  startDate: '2022-06-15T00:00:00',
  endDate: '2022-06-17T23:59:59',
  eventid: '3631282',
  pagenumber: '0',
  pagesize: '10'
});

fetch(`https://your-app.onrender.com/registrants?${params}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

## Common Use Cases

### 1. Today's Registrants
```
?startDate=2026-02-19T00:00:00&endDate=2026-02-19T23:59:59
```

### 2. This Week's Activity
```
?startDate=2026-02-14T00:00:00&endDate=2026-02-21T23:59:59
```

### 3. Last 30 Days
```
?startDate=2026-01-20T00:00:00&endDate=2026-02-19T23:59:59
```

### 4. Specific Event in Date Range
```
?startDate=2022-06-15T00:00:00&endDate=2022-06-30T23:59:59&eventid=3631282
```

### 5. High Engagement in Date Range
```
?startDate=2026-02-18T00:00:00&endDate=2026-02-21T23:59:59&engagementprediction=HIGH
```

## Important Notes

### Date Comparison
- The filter uses JavaScript `Date` object for comparison
- Dates are inclusive (>= startDate AND <= endDate)
- Timezone from the data is preserved

### Performance
- Date filtering happens BEFORE pagination
- Total count reflects filtered results
- Page count is calculated after filtering

### Combining Filters
Date range can be combined with:
- ✅ eventid
- ✅ clientid
- ✅ country
- ✅ engagementprediction
- ✅ Any other field
- ✅ Sorting
- ✅ Pagination

### Edge Cases
- **No startDate**: Returns all registrants up to endDate
- **No endDate**: Returns all registrants from startDate onwards
- **No dates**: Returns all registrants (no date filtering)
- **Invalid dates**: May return empty results
- **Registrants without lastactivity**: Excluded from results

## URL Encoding

When passing dates in URLs, special characters should be URL encoded:

| Character | Encoded |
|-----------|---------|
| : | %3A |
| - | - (no encoding needed) |

**Example:**
```
Raw: 2026-02-19T01:31:42
Encoded: 2026-02-19T01%3A31%3A42
```

Most HTTP clients handle this automatically.

## Summary

✅ **Filter Field**: `lastactivity`  
✅ **Parameters**: `startDate` and/or `endDate`  
✅ **Format**: ISO 8601 DateTime  
✅ **Inclusive**: Both start and end dates are inclusive  
✅ **Combinable**: Works with all other filters, sorting, and pagination  
✅ **Validation**: Still validates page numbers after filtering  

Your registrants API now supports powerful date range queries!
