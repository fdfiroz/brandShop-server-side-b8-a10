const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USERNAME_DB}:${process.env.PASSWORD_DB}@brandshop.hp9i2ws.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productsCollection = client.db("AutomotiveDB").collection("products");
        app.post("/api/add-product", async (req, res) => {
            const newProduct = req.body;
            console.log('adding new product: ', newProduct);
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
            
    })
    //searching for products 
    app.post("/api/search-products", async (req, res) => {
        const searchProduct = req.body;
        console.log('searching for product: ', searchProduct);
        const result = await productsCollection.find(searchProduct).toArray();
        res.send(result);
    })
    app.get("/api/products", async (req, res) => {
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        
        res.send( products);
    })
    //pagination 
    app.post("/api/products/:page", async (req, res) => {
        const page = req.params.page;
        const limit = req.body || 10;
        const skip = (page - 1) * limit;
        const cursor = productsCollection.find({}).skip(skip).limit(limit);
        const products = await cursor.toArray();
        res.send( products);
    })
    //update product
    app.put("/api/update-product/:id", async (req, res) => {
        const id = req.params.id;
        const updatedProduct = req.body;
        console.log('updating product: ', id);
        const filter = { _id: new ObjectId(id) };

        const options = { upsert: true };
        const updateDoc = {
            $set: {
                name: updatedProduct.name,
                price: updatedProduct.price,
                quantity: updatedProduct.quantity,
                description: updatedProduct.description,
                img: updatedProduct.img,
                brand: updatedProduct.brand,
                category: updatedProduct.category,
                rating: updatedProduct.rating,
                suggestion: updatedProduct.suggestion
            },
        };
        const result = await productsCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })

    //all uniq category names im a array and send to client side
    app.get("/api/categories", async (req, res) => {
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        const categories = [];
        products.forEach(product => {
            if (!categories.includes(product.category)) {
                categories.push(product.category);
            }
        });
        res.send(categories);
    })


    



    // add bulk products
    app.post("/add-products", async (req, res) => {
        const newProducts = req.body;
        console.log('adding new products: ', newProducts);
        const result = await productsCollection.insertMany(newProducts);
        res.send(result);
    })

    //sending the result to the client side


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
        res.send('Brand Server Running...')
});

app.listen(port, () => {
        console.log(`Server is running on port ${port}...`)
});