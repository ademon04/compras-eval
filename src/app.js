const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const suppliersRouter = require('./routes/suppliers');
const productsRouter = require('./routes/products');
const priceRequestsRouter = require('./routes/priceRequests');
const landedCostRouter = require('./routes/landedCost');

app.use('/api/suppliers', suppliersRouter);
app.use('/api/products', productsRouter);
app.use('/api/price-requests', priceRequestsRouter);
app.use('/api/landed-cost', landedCostRouter);

module.exports = app;