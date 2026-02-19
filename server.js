const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom middleware for ON24-style pagination
server.use((req, res, next) => {
  // Handle /events endpoint
  if (req.path === '/events' && req.method === 'GET') {
    const db = router.db;
    let events = db.get('events').value();
    
    const pageNumber = parseInt(req.query.pagenumber || 0);
    const pageSize = parseInt(req.query.pagesize || 100);
    
    // Apply filters
    const queryParams = { ...req.query };
    delete queryParams.pagenumber;
    delete queryParams.pagesize;
    
    Object.keys(queryParams).forEach(key => {
      if (key !== '_sort' && key !== '_order') {
        events = events.filter(event => {
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
    
    // Apply sorting
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
    const maxValidPage = pageCount - 1;
    
    if (currentPage < 0 || currentPage > maxValidPage) {
      return res.status(400).json({
        message: `Invalid pageOffset, range must be between 0 and ${maxValidPage}.`
      });
    }
    
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvents = events.slice(startIndex, endIndex);
    
    const response = {
      currentpage: currentPage,
      pagecount: pageCount,
      totalevents: totalEvents,
      events: paginatedEvents
    };
    
    res.json(response);
  } 
  // Handle /registrants endpoint
  else if (req.path === '/registrants' && req.method === 'GET') {
    const db = router.db;
    let registrants = db.get('registrants').value();
    
    const pageNumber = parseInt(req.query.pagenumber || 0);
    const pageSize = parseInt(req.query.pagesize || 100);

    // Get date range parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Apply filters
    const queryParams = { ...req.query };
    delete queryParams.pagenumber;
    delete queryParams.pagesize;
    delete queryParams.startDate;
    delete queryParams.endDate;

    // Apply date range filter if provided
    if (startDate || endDate) {
      registrants = registrants.filter(registrant => {
        const lastActivity = registrant.lastactivity;
        if (!lastActivity) return false;
        
        const activityDate = new Date(lastActivity);
        
        // Filter by startDate if provided
        if (startDate) {
          const start = new Date(startDate);
          if (activityDate < start) return false;
        }
        
        // Filter by endDate if provided
        if (endDate) {
          const end = new Date(endDate);
          if (activityDate > end) return false;
        }
        
        return true;
      });
    }
    
    Object.keys(queryParams).forEach(key => {
      if (key !== '_sort' && key !== '_order') {
        registrants = registrants.filter(registrant => {
          if (key.includes('.')) {
            const keys = key.split('.');
            let value = registrant;
            for (let k of keys) {
              value = value?.[k];
            }
            return value == queryParams[key];
          }
          return registrant[key] == queryParams[key];
        });
      }
    });
    
    // Apply sorting
    if (req.query._sort) {
      const sortField = req.query._sort;
      const sortOrder = req.query._order === 'desc' ? -1 : 1;
      registrants.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }
    
    const totalRegistrants = registrants.length;
    const pageCount = Math.ceil(totalRegistrants / pageSize);
    const currentPage = pageNumber;
    const maxValidPage = pageCount - 1;
    
    if (currentPage < 0 || currentPage > maxValidPage) {
      return res.status(400).json({
        message: `Invalid pageOffset, range must be between 0 and ${maxValidPage}.`
      });
    }
    
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRegistrants = registrants.slice(startIndex, endIndex);
    
    const response = {
      currentpage: currentPage,
      pagecount: pageCount,
      totalregistrants: totalRegistrants,
      registrants: paginatedRegistrants
    };
    
    res.json(response);
  } 
  else {
    next();
  }
});

server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`Use headers or query params: pagenumber and pagesize for pagination`);
});
