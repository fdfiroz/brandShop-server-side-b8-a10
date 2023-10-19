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
        app.post("/product", async (req, res) => {
            const newProduct = req.body;
            console.log('adding new product: ', newProduct);
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
            
    })
    //show product by Uid
    app.post("/product-by-uid", async (req, res) => {
        const uid = req.body.uid;
        const cursor = productsCollection.find({uid: uid});
        const products = await cursor.toArray();
        res.send(products);
    })
    //searching for products 
    app.post("/search-products", async (req, res) => {
        const searchProduct = req.body;
        console.log('searching for product: ', searchProduct);
        const result = await productsCollection.find(searchProduct).toArray();
        res.send(result);
    })
    app.get("/all-products", async (req, res) => {
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        
        res.send( products);
    })
    //pagination 
    app.post("/products/:page", async (req, res) => {
        const page = req.params.page;
        const limit = req.body || 10;
        const skip = (page - 1) * limit;
        const cursor = productsCollection.find({}).skip(skip).limit(limit);
        const products = await cursor.toArray();
        res.send( products);
    })
    //update product
    app.put("/update-product/:id", async (req, res) => {
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
    app.get("/categories", async (req, res) => {
        try {
            const categories = await productsCollection.distinct("category");
            res.json(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).send("Internal Server Error");
        }
    });
// add to cart
    const cartCollection = client.db("AutomotiveDB").collection("cart");
    app.post("/add-to-cart", async (req, res) => {
        const newProduct = req.body;
        console.log('adding new product: ', newProduct);
        const result = await cartCollection.insertOne(newProduct);
        res.send(result);
    })
    //get cart by email
    app.post("/user-cart", async (req, res) => {
        const email = req.body.email;
        const cursor = cartCollection.findOne({email: email});
        const products = await cursor.toArray();
        res.send(products);
    })
    //delete from cart by email
    app.delete("/cart-product/:id", async (req, res) => {
        const id = req.params.id;
        const result = await cartCollection.deleteOne({_id: new ObjectId(id)});
        res.send(result);
    })
    



    // // add bulk products
    // app.post("/products", async (req, res) => {
    //     const newProducts = req.body;
    //     console.log('adding new products: ', newProducts);
    //     const result = await productsCollection.insertMany(newProducts);
    //     res.send(result);
    // })

    //userinfo
    const userInfoCollection = client.db("AutomotiveDB").collection("userInfo");
    app.post("/user", async (req, res) => {
        const newUserInfo = req.body;
        console.log('adding new user info: ', newUserInfo);
        const result = await userInfoCollection.insertOne(newUserInfo);
        res.send(result);
    })
    //get user info by email
    app.post("/user-info", async (req, res) => {
        const email = req.body.email;
        const cursor = userInfoCollection.find({email: email});
        const userInfo = await cursor.toArray();
        res.send(userInfo);
    })
    //update user info
    app.patch("/user", async (req, res) => {
        const user = req.body;
        console.log('updating user info: ', user);
        const filter = { email: user.email }
        const updateDoc = {
            $set: {
                uid: user.uid,
                emailVerified: user.emailVerified,
                lastSignInTime: user.lastSignInTime,
                photoURL: user.photoURL,

            }
        }
        const result = await userInfoCollection.updateOne(filter, updateDoc);
        res.send(result);
    })
    app.put("/user", async (req, res) => {
        const user = req.body;
        console.log('updating user info: ', user);
        console.log('updating user info: ', user);
        const filter = { uid: user.uid }
        const updateDoc = {
            $set: {
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                emailVerified: user.emailVerified,
                lastSignInTime: user.lastSignInTime,
                createdAt: user.createdAt,
            }
        }
        const result = await userInfoCollection.updateOne(filter, updateDoc, {upsert: true});
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
        res.send(`Brand Server Running...
        <br>
        <a href="/products">Products</a>
        `)
});

app.listen(port, () => {
        console.log(`Server is running on port ${port}...`)
});