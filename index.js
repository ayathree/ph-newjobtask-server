const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
// get the object
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ycbv1lf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const productCollection = client.db('companyDB').collection('products');

    // read 
    app.get('/allProducts', async (req, res) => {
      const filter = req.query.filter;
      const filterTwo = req.query.filterTwo;
      const sort = req.query.sort;
      const search = req.query.search;
      const minPrice = parseFloat(req.query.minPrice); 
      const maxPrice = parseFloat(req.query.maxPrice); 
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 6;  
      const skip = (page - 1) * limit;
    
      const query = {
        productName : {$regex: search, $options:'i'}
      }; 
      if (filter) {
        query.categoryName = filter;
        
      }
      if(filterTwo){
        query.brandName = filterTwo;
      }

      if (minPrice && maxPrice) {
        query.price = { $gte: minPrice, $lte: maxPrice }; 
      } else if (minPrice) {
        query.price = { $gte: minPrice }; 
      } else if (maxPrice) {
        query.price = { $lte: maxPrice }; 
      }

      const option ={};
      if (sort) {
        if (sort === 'low') {
          option.price = 1; 
        } else if (sort === 'high') {
          option.price = -1; 
        } else if (sort === 'new') {
          option.dateAdded = -1;  
        }
      }
    
      try {
        const total = await productCollection.countDocuments(query);
        const products = await productCollection.find(query).sort(option).skip(skip).limit(limit).toArray();
        
    
        res.send({
          products,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          
        });
      } catch (error) {
        res.status(500).send({ message: 'Error fetching products', error });
      }
    });
    


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(' server is running ')
  });

app.listen(port, () => {
    console.log(`server is running  on port ${port}`)
 })