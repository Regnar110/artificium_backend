import express, {json, Express} from "express"
import cors from "cors"

const app:Express = express(); // express app init

app.use(json()) //BODY parsing from express
app.use(cors()) // Allow "unsafe" connections

app.get('/', (req, res) => {
    res.json("<h1>JEstem</h1>")
})

app.listen(3001, () => console.log("APP Running port 3001"))