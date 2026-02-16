# ON24-Style API with Custom Pagination - Complete Setup Guide

## Overview
This guide sets up a JSON Server API that mimics ON24's event API structure with custom pagination logic where:
- `pagesize` and `pagenumber` can be passed via headers or query parameters
- Response includes `currentpage`, `pagecount`, and `totalevents`
- Automatic page count calculation based on total events and page size

## Files You Need

### 1. `db.json` - Your Event Data

```json
{
  "events": [
    {
      "eventanalytics": {
        "totalregistrants": 63,
        "totalattendees": 44,
        "liveattendees": 43,
        "ondemandattendees": 3,
        "averageliveminutes": 105,
        "averagecumulativeliveminutes": 70,
        "averagearchiveminutes": 14,
        "averagecumulativearchiveminutes": 10,
        "totalcumulativeliveminutes": 4529,
        "totalcumulativearchiveminutes": 41,
        "totalcumulativeminutes": 4570,
        "totalmediaplayerminutes": 3978,
        "totallivemediaplayerminutes": 3976,
        "totalarchivemediaplayerminutes": 2
      },
      "eventid": 3631282,
      "clientid": 10001,
      "goodafter": "2022-02-22T09:00:00-08:00",
      "isactive": true,
      "ishybridevent": false,
      "regrequired": true,
      "eventtitle": "Product Launch Webinar 2022",
      "eventtype": "webinar",
      "presenter": "John Smith"
    },
    {
      "eventanalytics": {
        "totalregistrants": 150,
        "totalattendees": 120,
        "liveattendees": 115,
        "ondemandattendees": 8,
        "averageliveminutes": 95,
        "averagecumulativeliveminutes": 85,
        "averagearchiveminutes": 20,
        "averagecumulativearchiveminutes": 15,
        "totalcumulativeliveminutes": 9775,
        "totalcumulativearchiveminutes": 120,
        "totalcumulativeminutes": 9895,
        "totalmediaplayerminutes": 8900,
        "totallivemediaplayerminutes": 8850,
        "totalarchivemediaplayerminutes": 50
      },
      "eventid": 3631283,
      "clientid": 10001,
      "goodafter": "2022-03-15T10:00:00-08:00",
      "isactive": true,
      "ishybridevent": false,
      "regrequired": true,
      "eventtitle": "Q1 Training Session",
      "eventtype": "training",
      "presenter": "Jane Doe"
    },
    {
      "eventanalytics": {
        "totalregistrants": 200,
        "totalattendees": 180,
        "liveattendees": 175,
        "ondemandattendees": 12,
        "averageliveminutes": 120,
        "averagecumulativeliveminutes": 110,
        "averagearchiveminutes": 25,
        "averagecumulativearchiveminutes": 18,
        "totalcumulativeliveminutes": 19250,
        "totalcumulativearchiveminutes": 216,
        "totalcumulativeminutes": 19466,
        "totalmediaplayerminutes": 17500,
        "totallivemediaplayerminutes": 17400,
        "totalarchivemediaplayerminutes": 100
      },
      "eventid": 3631284,
      "clientid": 10001,
      "goodafter": "2022-04-20T11:00:00-08:00",
      "isactive": true,
      "ishybridevent": true,
      "regrequired": true,
      "eventtitle": "Customer Success Workshop",
      "eventtype": "workshop",
      "presenter": "Mike Johnson"
    },
    {
      "eventanalytics": {
        "totalregistrants": 85,
        "totalattendees": 70,
        "liveattendees": 68,
        "ondemandattendees": 5,
        "averageliveminutes": 88,
        "averagecumulativeliveminutes": 75,
        "averagearchiveminutes": 18,
        "averagecumulativearchiveminutes": 12,
        "totalcumulativeliveminutes": 5100,
        "totalcumulativearchiveminutes": 60,
        "totalcumulativeminutes": 5160,
        "totalmediaplayerminutes": 4800,
        "totallivemediaplayerminutes": 4780,
        "totalarchivemediaplayerminutes": 20
      },
      "eventid": 3631285,
      "clientid": 10001,
      "goodafter": "2022-05-10T14:00:00-08:00",
      "isactive": true,
      "ishybridevent": false,
      "regrequired": false,
      "eventtitle": "Product Demo Series",
      "eventtype": "demo",
      "presenter": "Sarah Williams"
    },
    {
      "eventanalytics": {
        "totalregistrants": 300,
        "totalattendees": 250,
        "liveattendees": 245,
        "ondemandattendees": 15,
        "averageliveminutes": 130,
        "averagecumulativeliveminutes": 115,
        "averagearchiveminutes": 30,
        "averagecumulativearchiveminutes": 22,
        "totalcumulativeliveminutes": 28175,
        "totalcumulativearchiveminutes": 330,
        "totalcumulativeminutes": 28505,
        "totalmediaplayerminutes": 26000,
        "totallivemediaplayerminutes": 25900,
        "totalarchivemediaplayerminutes": 100
      },
      "eventid": 3631286,
      "clientid": 10001,
      "goodafter": "2022-06-01T09:00:00-08:00",
      "isactive": true,
      "ishybridevent": true,
      "regrequired": true,
      "eventtitle": "Annual Conference 2022",
      "eventtype": "conference",
      "presenter": "Multiple Speakers"
    }
  ]
}
```

### 2. `server.js` - Custom Pagination Logic

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

### 3. `package.json`

```json
{
  "name": "on24-api-mock",
  "version": "1.0.0",
  "description": "ON24-style API with custom pagination",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "json-server": "^0.17.4"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Deployment Steps

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `on24-api-mock`
3. Make it Public
4. Click "Create repository"

### Step 2: Add Files to Repository
1. Click "creating a new file"
2. Create `db.json` with the content above
3. Commit
4. Create `server.js` with the content above
5. Commit
6. Create `package.json` with the content above
7. Commit

### Step 3: Deploy on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `on24-api-mock`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click "Create Web Service"
6. Wait 2-5 minutes for deployment

## API Usage Examples

Base URL: `https://your-app-name.onrender.com`

### Example 1: Get First Page (2 events per page)

**Using Query Parameters:**
```
GET https://your-app-name.onrender.com/events?pagenumber=0&pagesize=2
```

**Using Headers:**
```bash
curl -H "pagenumber: 0" -H "pagesize: 2" https://your-app-name.onrender.com/events
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    {
      "eventanalytics": { ... },
      "eventid": 3631282,
      "eventtitle": "Product Launch Webinar 2022",
      ...
    },
    {
      "eventanalytics": { ... },
      "eventid": 3631283,
      "eventtitle": "Q1 Training Session",
      ...
    }
  ]
}
```

**Explanation:**
- Total events = 5
- Page size = 2
- Page count = Math.ceil(5/2) = 3 pages
- Current page = 0 (first page)
- Returns events 1-2

### Example 2: Get Second Page (2 events per page)

```
GET https://your-app-name.onrender.com/events?pagenumber=1&pagesize=2
```

**Response:**
```json
{
  "currentpage": 1,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    {
      "eventanalytics": { ... },
      "eventid": 3631284,
      "eventtitle": "Customer Success Workshop",
      ...
    },
    {
      "eventanalytics": { ... },
      "eventid": 3631285,
      "eventtitle": "Product Demo Series",
      ...
    }
  ]
}
```

**Explanation:**
- Current page = 1 (second page)
- Returns events 3-4

### Example 3: Get Third Page (2 events per page)

```
GET https://your-app-name.onrender.com/events?pagenumber=2&pagesize=2
```

**Response:**
```json
{
  "currentpage": 2,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    {
      "eventanalytics": { ... },
      "eventid": 3631286,
      "eventtitle": "Annual Conference 2022",
      ...
    }
  ]
}
```

**Explanation:**
- Current page = 2 (third page)
- Returns event 5 (last event)
- Only 1 event on last page

### Example 4: Different Page Size (3 events per page)

```
GET https://your-app-name.onrender.com/events?pagenumber=0&pagesize=3
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 2,
  "totalevents": 5,
  "events": [
    { "eventid": 3631282, ... },
    { "eventid": 3631283, ... },
    { "eventid": 3631284, ... }
  ]
}
```

**Explanation:**
- Total events = 5
- Page size = 3
- Page count = Math.ceil(5/3) = 2 pages
- Returns first 3 events

### Example 5: Get All Events (No pagination)

```
GET https://your-app-name.onrender.com/events?pagesize=100
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalevents": 5,
  "events": [ ... all 5 events ... ]
}
```

### Example 6: Filter by Event Type + Pagination

```
GET https://your-app-name.onrender.com/events?eventtype=webinar&pagenumber=0&pagesize=2
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalevents": 1,
  "events": [
    {
      "eventid": 3631282,
      "eventtitle": "Product Launch Webinar 2022",
      "eventtype": "webinar",
      ...
    }
  ]
}
```

**Explanation:**
- Filters first (only webinar events)
- Then applies pagination
- Total events = 1 (after filter)
- Page count = 1

### Example 7: Filter by Active Events

```
GET https://your-app-name.onrender.com/events?isactive=true&pagenumber=0&pagesize=3
```

### Example 8: Filter by Client ID

```
GET https://your-app-name.onrender.com/events?clientid=10001&pagenumber=0&pagesize=2
```

### Example 9: Sort by Event ID

```
GET https://your-app-name.onrender.com/events?_sort=eventid&_order=desc&pagenumber=0&pagesize=2
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 3,
  "totalevents": 5,
  "events": [
    {
      "eventid": 3631286,
      "eventtitle": "Annual Conference 2022",
      ...
    },
    {
      "eventid": 3631285,
      "eventtitle": "Product Demo Series",
      ...
    }
  ]
}
```

## Pagination Logic Explanation

### How Page Count is Calculated

```javascript
totalEvents = 5 (total number of events in database or after filtering)
pageSize = 2 (from header or query param)

pageCount = Math.ceil(totalEvents / pageSize)
pageCount = Math.ceil(5 / 2)
pageCount = Math.ceil(2.5)
pageCount = 3
```

### How Current Page Works

- `pagenumber=0` → Shows events 1-2 (first page)
- `pagenumber=1` → Shows events 3-4 (second page)
- `pagenumber=2` → Shows events 5 (third page)

### Index Calculation

```javascript
pageNumber = 0, pageSize = 2
startIndex = 0 * 2 = 0
endIndex = 0 + 2 = 2
events = allEvents.slice(0, 2) // Returns events at index 0 and 1

pageNumber = 1, pageSize = 2
startIndex = 1 * 2 = 2
endIndex = 2 + 2 = 4
events = allEvents.slice(2, 4) // Returns events at index 2 and 3

pageNumber = 2, pageSize = 2
startIndex = 2 * 2 = 4
endIndex = 4 + 2 = 6
events = allEvents.slice(4, 6) // Returns events at index 4 (only 1 event left)
```

## Testing Your API

### Using Browser
Simply paste in browser:
```
https://your-app-name.onrender.com/events?pagenumber=0&pagesize=2
```

### Using Postman
1. Create GET request
2. URL: `https://your-app-name.onrender.com/events`
3. Add Headers:
   - `pagenumber`: 0
   - `pagesize`: 2
4. Send

### Using cURL
```bash
# Query parameters
curl "https://your-app-name.onrender.com/events?pagenumber=0&pagesize=2"

# Headers
curl -H "pagenumber: 0" -H "pagesize: 2" https://your-app-name.onrender.com/events
```

### Using JavaScript (Fetch)
```javascript
// Using query parameters
fetch('https://your-app-name.onrender.com/events?pagenumber=0&pagesize=2')
  .then(res => res.json())
  .then(data => console.log(data));

// Using headers
fetch('https://your-app-name.onrender.com/events', {
  headers: {
    'pagenumber': '0',
    'pagesize': '2'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Adding More Events

To add more events to test pagination:

1. Go to your GitHub repository
2. Click `db.json`
3. Click Edit (pencil icon)
4. Add more event objects to the "events" array
5. Commit changes
6. Render will auto-redeploy (2-3 minutes)

## Troubleshooting

**Q: Pagination not working?**
- Check spelling: `pagenumber` and `pagesize` (all lowercase)
- Verify values are numbers, not strings
- Check browser console for errors

**Q: Getting empty events array?**
- Check if pagenumber is too high
- Verify pagesize is not 0

**Q: Page count incorrect?**
- Verify total events count
- Check Math.ceil logic in server.js
- Test with simple numbers first (pagesize=2, 5 total events = 3 pages)

## Summary

✅ Custom pagination with `pagesize` and `pagenumber`  
✅ Automatic `pagecount` calculation  
✅ Works with headers OR query parameters  
✅ Supports filtering before pagination  
✅ Supports sorting  
✅ ON24-style response format  
✅ Free hosting on Render  

Your API is now ready to use with proper pagination logic!
