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
