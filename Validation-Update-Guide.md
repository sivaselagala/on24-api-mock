# ON24-Style API - Validation Update Guide

## New Validation Feature

The API now validates that `currentPage` (pagenumber) is within the valid range. If the page number is out of range, it returns a 400 Bad Request error with a dynamic message.

## Validation Logic

**Valid Range**: `0` to `(pageCount - 1)`

**Example Scenarios:**

### Scenario 1: 5 Total Events, Page Size = 2
- Total Events: 5
- Page Size: 2
- Page Count: Math.ceil(5/2) = 3
- **Valid Range: 0 to 2** (pages 0, 1, 2)
- **Invalid: 3 or higher, or negative numbers**

### Scenario 2: 5 Total Events, Page Size = 3
- Total Events: 5
- Page Size: 3
- Page Count: Math.ceil(5/3) = 2
- **Valid Range: 0 to 1** (pages 0, 1)
- **Invalid: 2 or higher, or negative numbers**

## Updated server.js Code

The validation is added right after calculating pageCount:

```javascript
const totalEvents = events.length;
const pageCount = Math.ceil(totalEvents / pageSize);
const currentPage = pageNumber;

// Validation: Check if currentPage is out of valid range
// Valid range is 0 to (pageCount - 1)
const maxValidPage = pageCount - 1;

if (currentPage < 0 || currentPage > maxValidPage) {
  return res.status(400).json({
    message: `Invalid pageOffset, range must be between 0 and ${maxValidPage}.`
  });
}

// Continue with normal pagination...
```

## Testing Examples

### Example 1: Valid Request (5 events, pagesize=2, page=0)

**Request:**
```
GET https://your-app.onrender.com/events?pagenumber=0&pagesize=2
```

**Response (200 OK):**
```json
{
  "currentpage": 0,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    { "eventid": 3631282, ... },
    { "eventid": 3631283, ... }
  ]
}
```

### Example 2: Valid Request - Last Page (5 events, pagesize=2, page=2)

**Request:**
```
GET https://your-app.onrender.com/events?pagenumber=2&pagesize=2
```

**Response (200 OK):**
```json
{
  "currentpage": 2,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    { "eventid": 3631286, ... }
  ]
}
```

### Example 3: Invalid Request - Page Out of Range (page=3)

**Request:**
```
GET https://your-app.onrender.com/events?pagenumber=3&pagesize=2
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 2."
}
```

**Explanation:**
- Total events: 5
- Page size: 2
- Page count: 3 (pages 0, 1, 2 are valid)
- Requesting page 3 is invalid
- Max valid page = 3 - 1 = 2

### Example 4: Invalid Request - Negative Page

**Request:**
```
GET https://your-app.onrender.com/events?pagenumber=-1&pagesize=2
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 2."
}
```

### Example 5: Different Page Size - Invalid

**Request:**
```
GET https://your-app.onrender.com/events?pagenumber=2&pagesize=3
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 1."
}
```

**Explanation:**
- Total events: 5
- Page size: 3
- Page count: Math.ceil(5/3) = 2 (pages 0, 1 are valid)
- Requesting page 2 is invalid
- Max valid page = 2 - 1 = 1

### Example 6: With Filters - Invalid Page

**Request:**
```
GET https://your-app.onrender.com/events?eventtype=webinar&pagenumber=1&pagesize=2
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 0."
}
```

**Explanation:**
- Filter reduces events to 1 (only 1 webinar)
- Page size: 2
- Page count: Math.ceil(1/2) = 1 (only page 0 is valid)
- Requesting page 1 is invalid
- Max valid page = 1 - 1 = 0

### Example 7: Edge Case - Single Event

**Request:**
```
GET https://your-app.onrender.com/events?eventid=3631282&pagenumber=1&pagesize=1
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 0."
}
```

**Explanation:**
- Filter by eventid gives 1 event
- Page size: 1
- Page count: 1
- Only page 0 is valid

## Testing with cURL

### Test Valid Page
```bash
curl "https://your-app.onrender.com/events?pagenumber=0&pagesize=2"
```

### Test Invalid Page (should return 400)
```bash
curl -i "https://your-app.onrender.com/events?pagenumber=3&pagesize=2"
```

The `-i` flag shows headers including the HTTP status code.

### Test with Headers
```bash
curl -i -H "pagenumber: 5" -H "pagesize: 2" https://your-app.onrender.com/events
```

## Testing with JavaScript

```javascript
async function testPagination() {
  try {
    // Test invalid page
    const response = await fetch('https://your-app.onrender.com/events?pagenumber=10&pagesize=2');
    
    if (!response.ok) {
      const error = await response.json();
      console.log('Status:', response.status); // 400
      console.log('Error:', error.message); // "Invalid pageOffset, range must be between 0 and 2."
    }
  } catch (err) {
    console.error(err);
  }
}
```

## Testing with Postman

1. Create GET request: `https://your-app.onrender.com/events`
2. Add query params:
   - `pagenumber`: 10
   - `pagesize`: 2
3. Send
4. Check:
   - Status should be `400 Bad Request`
   - Body should show error message

## Dynamic Range Calculation

The range is **always calculated dynamically** based on:

```javascript
maxValidPage = Math.ceil(totalEvents / pageSize) - 1
```

**Examples:**

| Total Events | Page Size | Page Count | Valid Range | Invalid Examples |
|--------------|-----------|------------|-------------|------------------|
| 5            | 2         | 3          | 0 to 2      | 3, 4, -1         |
| 5            | 3         | 2          | 0 to 1      | 2, 3, -1         |
| 5            | 5         | 1          | 0 to 0      | 1, 2, -1         |
| 10           | 3         | 4          | 0 to 3      | 4, 5, -1         |
| 1            | 1         | 1          | 0 to 0      | 1, 2, -1         |
| 100          | 10        | 10         | 0 to 9      | 10, 11, -1       |

## Error Response Format

All validation errors follow this format:

```json
{
  "message": "Invalid pageOffset, range must be between 0 and X."
}
```

Where `X` is dynamically calculated as `(pageCount - 1)`.

## Status Codes

- **200 OK**: Valid page request with data
- **400 Bad Request**: Page number out of valid range

## Complete Updated server.js

```javascript
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom middleware for ON24-style pagination
server.use((req, res, next) => {
  if (req.path === '/events' && req.method === 'GET') {
    const db = router.db; // Get the database
    let events = db.get('events').value(); // Get all events
    
    // Get pagination parameters from headers or query params
    const pageNumber = parseInt(req.headers['pagenumber'] || req.query.pagenumber || 0);
    const pageSize = parseInt(req.headers['pagesize'] || req.query.pagesize || 10);
    
    // Apply any filters first
    const queryParams = { ...req.query };
    delete queryParams.pagenumber;
    delete queryParams.pagesize;
    
    // Filter events based on query parameters
    Object.keys(queryParams).forEach(key => {
      if (key !== '_sort' && key !== '_order') {
        events = events.filter(event => {
          // Handle nested properties like eventanalytics.totalregistrants
          if (key.includes('.')) {
            const keys = key.split('.');
            let value = event;
            for (let k of keys) {
              value = value?.[k];
            }
            return value == queryParams[key];
          }
          return event[key] == queryParams[key];
        });
      }
    });
    
    // Apply sorting if requested
    if (req.query._sort) {
      const sortField = req.query._sort;
      const sortOrder = req.query._order === 'desc' ? -1 : 1;
      events.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }
    
    const totalEvents = events.length;
    const pageCount = Math.ceil(totalEvents / pageSize);
    const currentPage = pageNumber;
    
    // Validation: Check if currentPage is out of valid range
    // Valid range is 0 to (pageCount - 1)
    const maxValidPage = pageCount - 1;
    
    if (currentPage < 0 || currentPage > maxValidPage) {
      return res.status(400).json({
        message: `Invalid pageOffset, range must be between 0 and ${maxValidPage}.`
      });
    }
    
    // Calculate start and end indices for pagination
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Get the events for current page
    const paginatedEvents = events.slice(startIndex, endIndex);
    
    // Build the ON24-style response
    const response = {
      currentpage: currentPage,
      pagecount: pageCount,
      totalevents: totalEvents,
      events: paginatedEvents
    };
    
    res.json(response);
  } else {
    next();
  }
});

server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`Use headers or query params: pagenumber and pagesize for pagination`);
});
```

## Deployment Update

To update your existing Render deployment:

1. Go to your GitHub repository
2. Edit `server.js`
3. Replace with the updated code above
4. Commit changes
5. Render will automatically redeploy (2-3 minutes)
6. Test the validation with invalid page numbers

## Summary of Changes

✅ Added validation for page number range  
✅ Returns 400 status code for invalid pages  
✅ Dynamic error message with correct range  
✅ Works with filters (calculates range after filtering)  
✅ Handles negative page numbers  
✅ Handles pages beyond maximum  

Your API now properly validates pagination requests just like ON24!
