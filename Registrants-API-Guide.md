# Registrants API Endpoint - Complete Guide

## Overview
Your API now has TWO endpoints with the same pagination logic:
1. `/events` - Returns event data
2. `/registrants` - Returns registrant data

Both endpoints support the same features: pagination, filtering, sorting, and validation.

## Registrants Endpoint

### Base URL
```
GET https://your-app.onrender.com/registrants
```

### Response Format
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 4,
  "registrants": [...]
}
```

## Sample Registrant Data Structure

Each registrant object contains:
```json
{
  "firstname": "Johnson",
  "lastname": "Tsai",
  "email": "12@ccico.com",
  "company": "Instruments Co., Ltd",
  "jobtitle": "manager",
  "addressstreet1": "19F-9, No.2, Chung Shan 2nd Road",
  "addressstreet2": "No 100, Yun Shan Road",
  "city": "高雄市",
  "zip": "831",
  "country": "Taiwan",
  "workphone": "21212",
  "companyindustry": "Contractor/Service Co - high voltage",
  "clientid": 10001,
  "eventid": 3631282,
  "eventuserid": 12331322,
  "marketingemail": "N",
  "eventemail": "Y",
  "createtimestamp": "2022-06-15T23:52:31-07:00",
  "lastactivity": "2022-06-15T23:52:31-07:00",
  "ipaddress": "114.47.31.207",
  "os": "win10",
  "browser": "edge102",
  "emailformat": "text",
  "engagementprediction": "MEDIUM",
  "sourceeventid": 3631282,
  "userstatus": "active",
  "utmsource": "SAPHybris",
  "utmmedium": "email",
  "utmcampaign": "6438",
  "utmterm": "External webinars_Jun22_4_APAC",
  "utmcontent": "EN"
}
```

## Usage Examples

### Example 1: Get All Registrants (Default Pagination)

**Request:**
```
GET https://your-app.onrender.com/registrants
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Johnson", "lastname": "Tsai", ... },
    { "firstname": "Johnson", "lastname": "Tsai", ... },
    { "firstname": "Sarah", "lastname": "Chen", ... },
    { "firstname": "Michael", "lastname": "Brown", ... }
  ]
}
```

### Example 2: Paginated Registrants (2 per page)

**Request:**
```
GET https://your-app.onrender.com/registrants?pagenumber=0&pagesize=2
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 2,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Johnson", "lastname": "Tsai", "email": "12@ccico.com", ... },
    { "firstname": "Johnson", "lastname": "Tsai", "email": "a@ccico.com", ... }
  ]
}
```

### Example 3: Get Second Page

**Request:**
```
GET https://your-app.onrender.com/registrants?pagenumber=1&pagesize=2
```

**Response:**
```json
{
  "currentpage": 1,
  "pagecount": 2,
  "totalregistrants": 4,
  "registrants": [
    { "firstname": "Sarah", "lastname": "Chen", ... },
    { "firstname": "Michael", "lastname": "Brown", ... }
  ]
}
```

### Example 4: Filter by Event ID

**Request:**
```
GET https://your-app.onrender.com/registrants?eventid=3631282
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 2,
  "registrants": [
    { "firstname": "Johnson", "eventid": 3631282, ... },
    { "firstname": "Michael", "eventid": 3631282, ... }
  ]
}
```

**Explanation:**
- Filters to only show registrants for event 3631282
- Total registrants = 2 (after filtering)
- Returns both Johnson and Michael who registered for this event

### Example 5: Filter by Country

**Request:**
```
GET https://your-app.onrender.com/registrants?country=Taiwan
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 2,
  "registrants": [
    { "firstname": "Johnson", "country": "Taiwan", ... },
    { "firstname": "Johnson", "country": "Taiwan", ... }
  ]
}
```

### Example 6: Filter by Multiple Fields

**Request:**
```
GET https://your-app.onrender.com/registrants?eventid=3631282&country=Taiwan
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 1,
  "registrants": [
    { "firstname": "Johnson", "eventid": 3631282, "country": "Taiwan", ... }
  ]
}
```

### Example 7: Filter by Email Marketing Preference

**Request:**
```
GET https://your-app.onrender.com/registrants?marketingemail=Y
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 2,
  "registrants": [
    { "firstname": "Sarah", "marketingemail": "Y", ... },
    { "firstname": "Michael", "marketingemail": "Y", ... }
  ]
}
```

### Example 8: Filter by Engagement Prediction

**Request:**
```
GET https://your-app.onrender.com/registrants?engagementprediction=HIGH
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 1,
  "registrants": [
    { "firstname": "Sarah", "engagementprediction": "HIGH", ... }
  ]
}
```

### Example 9: Sort by Last Name

**Request:**
```
GET https://your-app.onrender.com/registrants?_sort=lastname&_order=asc
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 1,
  "totalregistrants": 4,
  "registrants": [
    { "lastname": "Brown", ... },
    { "lastname": "Chen", ... },
    { "lastname": "Tsai", ... },
    { "lastname": "Tsai", ... }
  ]
}
```

### Example 10: Sort by Registration Date (Descending)

**Request:**
```
GET https://your-app.onrender.com/registrants?_sort=createtimestamp&_order=desc
```

### Example 11: Filter + Pagination + Sort

**Request:**
```
GET https://your-app.onrender.com/registrants?eventid=3631282&pagenumber=0&pagesize=1&_sort=lastname&_order=asc
```

**Response:**
```json
{
  "currentpage": 0,
  "pagecount": 2,
  "totalregistrants": 2,
  "registrants": [
    { "firstname": "Michael", "lastname": "Brown", "eventid": 3631282, ... }
  ]
}
```

### Example 12: Invalid Page Number

**Request:**
```
GET https://your-app.onrender.com/registrants?pagenumber=5&pagesize=2
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid pageOffset, range must be between 0 and 1."
}
```

**Explanation:**
- Total registrants = 4
- Page size = 2
- Page count = 2 (pages 0 and 1 are valid)
- Requesting page 5 is out of range

## Common Filtering Fields

| Field | Example Value | Description |
|-------|---------------|-------------|
| eventid | 3631282 | Filter by event |
| clientid | 10001 | Filter by client |
| country | Taiwan | Filter by country |
| city | Chicago | Filter by city |
| marketingemail | Y | Email preference (Y/N) |
| eventemail | Y | Event email preference (Y/N) |
| userstatus | active | User status |
| engagementprediction | HIGH | Engagement level (HIGH/MEDIUM/LOW) |
| os | win10 | Operating system |
| browser | chrome103 | Browser type |
| utmsource | LinkedIn | UTM source |
| utmmedium | email | UTM medium |
| utmcampaign | 6438 | Campaign ID |

## Testing with cURL

### Get all registrants
```bash
curl "https://your-app.onrender.com/registrants"
```

### Filter by event
```bash
curl "https://your-app.onrender.com/registrants?eventid=3631282"
```

### Paginated results
```bash
curl "https://your-app.onrender.com/registrants?pagenumber=0&pagesize=2"
```

### Multiple filters
```bash
curl "https://your-app.onrender.com/registrants?eventid=3631282&country=Taiwan"
```

## Testing with JavaScript

```javascript
// Fetch all registrants
fetch('https://your-app.onrender.com/registrants')
  .then(res => res.json())
  .then(data => {
    console.log('Total Registrants:', data.totalregistrants);
    console.log('Page Count:', data.pagecount);
    console.log('Registrants:', data.registrants);
  });

// Filter by event ID
fetch('https://your-app.onrender.com/registrants?eventid=3631282')
  .then(res => res.json())
  .then(data => console.log(data));

// Paginated with filters
fetch('https://your-app.onrender.com/registrants?eventid=3631282&pagenumber=0&pagesize=5')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Combined Events + Registrants Queries

You can query both endpoints to get complete information:

```javascript
// Get event details first
const eventId = 3631282;

// Get event info
const eventResponse = await fetch(`https://your-app.onrender.com/events?eventid=${eventId}`);
const eventData = await eventResponse.json();

// Get registrants for that event
const registrantsResponse = await fetch(`https://your-app.onrender.com/registrants?eventid=${eventId}`);
const registrantsData = await registrantsResponse.json();

console.log('Event:', eventData.events[0]);
console.log('Total Registrants:', registrantsData.totalregistrants);
console.log('Registrants:', registrantsData.registrants);
```

## Summary

### Both Endpoints Support:
✅ Pagination (pagenumber, pagesize)  
✅ Filtering (by any field)  
✅ Sorting (_sort, _order)  
✅ Validation (400 error for invalid pages)  
✅ Same response format pattern

### Response Differences:
- `/events` returns: `totalevents` and `events` array
- `/registrants` returns: `totalregistrants` and `registrants` array

### Key Fields for Filtering:
- **Events**: eventid, clientid, eventtype, isactive, presenter
- **Registrants**: eventid, clientid, country, marketingemail, engagementprediction

Your API is now ready to handle both events and registrants data with full pagination support!
