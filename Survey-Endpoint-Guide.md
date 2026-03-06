# Survey Endpoint Implementation Guide

## Overview
This guide explains how to add survey data to your existing ON24 mock API and access it via a new endpoint: `/event/:eventid/survey`

## New Endpoint

### URL Pattern
```
GET /event/{eventid}/survey
```

### Examples
```
GET https://on24-api-mock.onrender.com/event/1234/survey
GET https://on24-api-mock.onrender.com/event/5678/survey
```

## Updated db.json Structure

Your `db.json` now needs a `surveys` array added to it. Here's the complete structure:

```json
{
  "events": [ ... your existing events ... ],
  "registrants": [ ... your existing registrants ... ],
  "attendees": [ ... your existing attendees ... ],
  "surveys": [
    {
      "eventid": 1234,
      "surveys": [
        {
          "surveyid": "1234_survey1",
          "surveycode": "survey1",
          "surveyquestions": [
            {
              "questionid": 49397914,
              "questiontype": "singleoption",
              "question": "Please rate the overall quality of the webinar's content",
              "responses": 96,
              "surveyanswer": [
                {
                  "answercode": "choice1",
                  "answer": "Excellent",
                  "percentage": 69.8
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Adding Surveys to Your Existing db.json

### Step 1: Open your current db.json

Your current file looks like this:
```json
{
  "events": [ ... ],
  "registrants": [ ... ],
  "attendees": [ ... ]
}
```

### Step 2: Add surveys array

Add a comma after the `attendees` array and insert the `surveys` section:

```json
{
  "events": [ ... ],
  "registrants": [ ... ],
  "attendees": [ ... ],
  "surveys": [
    {
      "eventid": 1234,
      "surveys": [ ... ]
    }
  ]
}
```

## Complete Survey Data Structure

Based on your example, here's the complete survey entry:

```json
{
  "eventid": 1234,
  "surveys": [
    {
      "surveyid": "1234_survey1",
      "surveycode": "survey1",
      "surveyquestions": [
        {
          "questionid": 49397914,
          "questiontype": "singleoption",
          "question": "Please rate the overall quality of the webinar's content",
          "responses": 96,
          "surveyanswer": [
            {
              "answercode": "choice1",
              "answer": "Excellent",
              "percentage": 69.8
            },
            {
              "answercode": "choice2",
              "answer": "Good",
              "percentage": 27.1
            },
            {
              "answercode": "choice3",
              "answer": "Fair",
              "percentage": 3.1
            },
            {
              "answercode": "choice4",
              "answer": "Poor",
              "percentage": 0.0
            }
          ]
        },
        {
          "questionid": 49397915,
          "questiontype": "singleoption",
          "question": "Please rate the overall effectiveness of the speaker",
          "responses": 96,
          "surveyanswer": [
            {
              "answercode": "choice1",
              "answer": "Excellent",
              "percentage": 71.9
            },
            {
              "answercode": "choice2",
              "answer": "Good",
              "percentage": 26.1
            },
            {
              "answercode": "choice3",
              "answer": "Fair",
              "percentage": 1.0
            },
            {
              "answercode": "choice4",
              "answer": "Poor",
              "percentage": 1.0
            }
          ]
        }
      ]
    }
  ]
}
```

## Usage Examples

### Example 1: Get Survey for Event 1234

**Request:**
```
GET https://on24-api-mock.onrender.com/event/1234/survey
```

**Response (200 OK):**
```json
{
  "eventid": 1234,
  "surveys": [
    {
      "surveyid": "1234_survey1",
      "surveycode": "survey1",
      "surveyquestions": [
        {
          "questionid": 49397914,
          "questiontype": "singleoption",
          "question": "Please rate the overall quality of the webinar's content",
          "responses": 96,
          "surveyanswer": [
            {
              "answercode": "choice1",
              "answer": "Excellent",
              "percentage": 69.8
            },
            ...
          ]
        }
      ]
    }
  ]
}
```

### Example 2: Survey Not Found

**Request:**
```
GET https://on24-api-mock.onrender.com/event/9999/survey
```

**Response (404 Not Found):**
```json
{
  "message": "No survey found for event ID 9999"
}
```

## Testing with cURL

### Test existing survey
```bash
curl https://on24-api-mock.onrender.com/event/1234/survey
```

### Test non-existent survey
```bash
curl https://on24-api-mock.onrender.com/event/9999/survey
```

## Testing with JavaScript

```javascript
// Fetch survey for event 1234
fetch('https://on24-api-mock.onrender.com/event/1234/survey')
  .then(res => res.json())
  .then(data => {
    console.log('Survey data:', data);
    console.log('Questions:', data.surveys[0].surveyquestions);
  });

// Handle 404 error
fetch('https://on24-api-mock.onrender.com/event/9999/survey')
  .then(res => {
    if (!res.ok) {
      console.log('Status:', res.status); // 404
    }
    return res.json();
  })
  .then(data => console.log(data.message));
```

## How It Works

### Server Logic

The server.js code matches the URL pattern:

```javascript
// Pattern: /event/:eventid/survey
req.path.match(/^\/event\/\d+\/survey$/)
```

Then it:
1. Extracts the event ID from the URL
2. Searches the surveys array for matching eventid
3. Returns the survey if found, or 404 if not found

```javascript
// Extract eventid from path
const eventid = parseInt(req.path.split('/')[2]);

// Find survey for the specific eventid
const eventSurvey = surveys.find(s => s.eventid === eventid);

if (!eventSurvey) {
  return res.status(404).json({
    message: `No survey found for event ID ${eventid}`
  });
}

res.json(eventSurvey);
```

## Adding More Surveys

To add surveys for more events, simply add more objects to the surveys array:

```json
{
  "surveys": [
    {
      "eventid": 1234,
      "surveys": [ ... ]
    },
    {
      "eventid": 5678,
      "surveys": [ ... ]
    },
    {
      "eventid": 9012,
      "surveys": [ ... ]
    }
  ]
}
```

## Integration with Existing Endpoints

Your API now has **4 endpoints**:

| Endpoint | Description | Pagination | Date Filter |
|----------|-------------|------------|-------------|
| `/events` | Get events | ✅ | ❌ |
| `/registrants` | Get registrants | ✅ | ✅ (lastactivity) |
| `/attendee` | Get attendees | ✅ | ✅ (lastliveactivity) |
| `/event/:eventid/survey` | Get survey by event | ❌ | ❌ |

## Deployment Steps

### 1. Update db.json on GitHub

```bash
# Edit your db.json file
# Add the "surveys" array after "attendees"

git add db.json
git commit -m "Add surveys data for event survey endpoint"
git push origin main
```

### 2. Update server.js on GitHub

```bash
# Replace your server.js with the new version

git add server.js
git commit -m "Add survey endpoint /event/:eventid/survey"
git push origin main
```

### 3. Render Auto-Deploys

Render will automatically:
- Detect the changes
- Redeploy your service (2-3 minutes)
- Make the new endpoint available

### 4. Test the New Endpoint

```bash
# Test survey endpoint
curl https://on24-api-mock.onrender.com/event/1234/survey

# Test all endpoints still work
curl https://on24-api-mock.onrender.com/events?pagenumber=0&pagesize=2
curl https://on24-api-mock.onrender.com/registrants?eventid=3631282
curl https://on24-api-mock.onrender.com/attendee?pagenumber=0&pagesize=2
```

## Error Handling

### Valid Responses

**Survey Found (200):**
```json
{
  "eventid": 1234,
  "surveys": [ ... ]
}
```

**Survey Not Found (404):**
```json
{
  "message": "No survey found for event ID 9999"
}
```

### Invalid Requests

**Invalid URL format:**
```
GET /event/abc/survey
```
Will be handled by JSON Server's default routes (may return 404)

**Missing eventid:**
```
GET /event//survey
```
Will be handled by JSON Server's default routes (may return 404)

## Complete Example with All Endpoints

```javascript
const baseUrl = 'https://on24-api-mock.onrender.com';

// 1. Get events
const events = await fetch(`${baseUrl}/events?pagenumber=0&pagesize=5`)
  .then(res => res.json());

// 2. For first event, get registrants
const firstEventId = events.events[0].eventid;
const registrants = await fetch(`${baseUrl}/registrants?eventid=${firstEventId}`)
  .then(res => res.json());

// 3. Get attendees for that event
const attendees = await fetch(`${baseUrl}/attendee?eventid=${firstEventId}`)
  .then(res => res.json());

// 4. Get survey for that event
const survey = await fetch(`${baseUrl}/event/${firstEventId}/survey`)
  .then(res => res.json());

console.log('Event:', events.events[0]);
console.log('Registrants:', registrants.totalregistrants);
console.log('Attendees:', attendees.totalattendees);
console.log('Survey Questions:', survey.surveys[0].surveyquestions.length);
```

## Summary

✅ **New Endpoint**: `/event/:eventid/survey`  
✅ **Returns**: Survey data for specific event  
✅ **Error Handling**: 404 if survey not found  
✅ **URL Pattern**: Uses event ID from URL path  
✅ **No Pagination**: Returns complete survey data  
✅ **Compatible**: Works alongside existing endpoints  

Your ON24 mock API is now complete with event, registrant, attendee, and survey endpoints!
