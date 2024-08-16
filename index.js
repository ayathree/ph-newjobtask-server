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
      const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 6;  // Default to 10 items per page if not provided
      const skip = (page - 1) * limit;
    
      const query = {};  // Modify this if you want to filter or search
    
      try {
        const total = await productCollection.countDocuments(query);
        const products = await productCollection.find(query).skip(skip).limit(limit).toArray();
    
        res.send({
          products,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total
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