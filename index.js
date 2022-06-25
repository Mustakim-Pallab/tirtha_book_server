const express = require('express');
const fileUpload= require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const crypto = require('crypto');
var moment = require('moment'); 
require('dotenv').config();
const path= require('path');


const app = express();
const port =process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/api/images',express.static('novels_images'));
app.use('/api/images',express.static('artwork_images'));
app.use('/api/images',express.static('stored_content'));
app.use(fileUpload());



const { MongoClient, ServerApiVersion } = require('mongodb');
const { request, response } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0z2dr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
  
      await client.connect();
      const database = client.db("Tirtha_Database");  
      const novelsCollection = database.collection("Novels");
      const artworksCollection =  database.collection("Artworks");
      const storedContentCollection = database.collection("Stored_Content");


      // create a document to insert novels
      app.post('/api/novels', async(request,response)=>{
        const {
          name, 
          author,
          synopsis,
          genre,
          tags,
        } = request.body;
        const views=0;
        const ratings=0;
        const likes =0;  
        const chapters=[];
        // console.log(request.body);
        const {image} = request.files; //use image as key name
        // console.log(image.name);
        const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'novels'+ image.name;//image.mimetype               
        image.mv(`${__dirname}/novels_images/${imagename}`,err=>{
          if (err){
            console.log(err);
          }
        });
        const result = await novelsCollection.insertOne({
          name, 
          author,
          synopsis,
          genre,
          tags,
          imagename,
          views,
          ratings,
          likes,
          chapters
        });    
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        response.send(result);
      });


      //get all the novels
      app.get('/api/novels', async(request,response)=>{     
        const getNovelList= novelsCollection.find({});
        const NovelList =await getNovelList.toArray();
        response.send(NovelList);
      });


      //get a particular novel
      app.get('/api/novels/:id', async(request,response)=>{
        const id= request.params.id;
        const query ={_id: ObjectId(id) };
        const novel =await novelsCollection.findOne(query);
        response.send(novel);

      });


      //adding new chapter in a particular novel
      app.patch('/api/novels/:id', async(req,res)=>{
        const id=req.params.id;
        const query ={_id:ObjectId(id)};
        const updateChapter=req.body;
        const options ={upsert:true};
        const updateDoc={
          $push:{
            chapters:{
              chapter_name: updateChapter.chapter_name,
              chapter_text: updateChapter.chapter_text,
              last_update:  moment().format('ll') 
            }
          }
        };
        const result=await novelsCollection.updateOne(query,updateDoc,options);
        console.log("updated");
        res.json(result)
      });


      //delete a novel
      app.delete('/api/novels/:id',async(req,res)=>{
        const id=req.params.id;
        const query ={_id:ObjectId(id)};
        const result=await novelsCollection.deleteOne(query);
        console.log("deleted: ",result);
        res.json(result);
      });


      /**********************novel ends here****************************/


      /**********************artwork begins here***********************/


      //add artwork
      app.post('/api/artworks', async(request,response)=>{
        const {
          title, 
          artist,
          subheader,
        } = request.body;
        const views=0;
        const {image} = request.files; //use image as key name
        const imagename=Date.now() + crypto.randomBytes(20).toString('hex') +'artwork'+ image.name;//image.mimetype
        image.mv(`${__dirname}/artwork_images/${imagename}`,err=>{
          if (err){
            console.log(err);
          }
        });
        const result = await artworksCollection.insertOne({
          title, 
          artist,
          views,
          subheader,
          imagename
        });
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        response.send(result);
      });



      //get all the artwork
      app.get('/api/artworks', async(request,response)=>{
        const getArtworkList= artworksCollection.find({});
        const artworkList =await getArtworkList.toArray();
        response.send(artworkList);
      });



      //get a particular arkwork
      app.get('/api/artworks/:id', async(request,response)=>{
        const id= request.params.id;
        const query ={_id: ObjectId(id) };
        const artwork =await artworksCollection.findOne(query);
        response.send(artwork);

      });


      //delete an artwork
      app.delete('/api/artworks/:id',async(req,res)=>{
        const id=req.params.id;
        const query ={_id:ObjectId(id)};
        const result=await artworksCollection.deleteOne(query);
        console.log("deleted: ",result);
        res.json(result);
      });
/*****************************Artwork ends here***************************/

/*****************************Stored Content Begins Here******************/

app.patch('/api/storedContent/heroSlider1/:id',async(request,res)=>{
  const id=request.params.id;
  const query ={_id:ObjectId(id)};
  console.log(request.files);
  const {heroSlider1} = request.files; //use image as key name
  const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'heroSlider1'+ heroSlider1.name;//image.mimetype               
  heroSlider1.mv(`${__dirname}/stored_content/${imagename}`,err=>{

    if (err){
      console.log(err);
    }
  });
  const options ={upsert:true};
  const updateImg={
    $set:{
      heroSlider1: imagename,
    }
  };
  const result=await storedContentCollection.updateOne(query,updateImg,options);
  console.log("updated");
  res.json(result)
});
app.patch('/api/storedContent/heroSlider2/:id',async(request,res)=>{
        const id=request.params.id;
        const query ={_id:ObjectId(id)};
        console.log(request.files);
        const {heroSlider2} = request.files; //use image as key name
        const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'heroSlider2'+ heroSlider2.name;//image.mimetype               
        heroSlider2.mv(`${__dirname}/stored_content/${imagename}`,err=>{

          if (err){
            console.log(err);
          }
        });
        const options ={upsert:true};
        const updateImg={
          $set:{
            heroSlider2: imagename,
          }
        };
        const result=await storedContentCollection.updateOne(query,updateImg,options);
        console.log("updated");
        res.json(result)
});

app.patch('/api/storedContent/heroSlider3/:id',async(request,res)=>{
  const id=request.params.id;
  const query ={_id:ObjectId(id)};
  const {heroSlider3} = request.files; //use image as key name
  const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'heroSlider3'+ heroSlider3.name;//image.mimetype               
  heroSlider3.mv(`${__dirname}/stored_content/${imagename}`,err=>{
    if (err){
      console.log(err);
    }
  });
  const options ={upsert:true};
  const updateImg={
    $set:{
      heroSlider3: imagename,
    }
  };
  const result=await storedContentCollection.updateOne(query,updateImg,options);
  console.log("updated");
  res.json(result)
});

app.patch('/api/storedContent/novelThumbnail/:id',async(request,res)=>{
  const id=request.params.id;
  const query ={_id:ObjectId(id)};
  const {novelThumbnail} = request.files; //use image as key name
  const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'novelThumbnail'+ novelThumbnail.name;//image.mimetype               
  novelThumbnail.mv(`${__dirname}/stored_content/${imagename}`,err=>{
    if (err){
      console.log(err);
    }
  });
  const options ={upsert:true};
  const updateImg={
    $set:{
      novelThumbnail : imagename,
    }
  };
  const result=await storedContentCollection.updateOne(query,updateImg,options);
  console.log("updated");
  res.json(result)
});


app.patch('/api/storedContent/artworkThumbnail/:id',async(request,res)=>{
  const id= request.params.id;
  const query ={_id:ObjectId(id)};
  const {artworkThumbnail} = request.files; //use image as key name
  const imagename=Date.now() + crypto.randomBytes(20).toString('hex') + 'artwork_thumbnail'+ artworkThumbnail.name;//image.mimetype               
  artworkThumbnail.mv(`${__dirname}/stored_content/${imagename}`,err=>{
    if (err){
      console.log(err);
    }
  });
  const options ={upsert:true};
  const updateImg={
    $set:{
      artworkThumbnail: imagename,
    }
  };
  const result=await storedContentCollection.updateOne(query,updateImg,options);
  console.log("updated");
  res.json(result)
});

app.get('/api/storedContent', async(request,response)=>{
  const getstoredContent= storedContentCollection.find({});
  const storedContent =await getstoredContent.toArray();
  response.send(storedContent);
});

    } finally {
  
    //   await client.close();
  
    }
  
  }
  

  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Tirtha server Successfully');
});

app.listen(port, () => {
    console.log('Running Server onn port', port);
})



// {
//     "Name":"Stupore E Tremori",
//     "Author":"Tirtha Chowdhury",
//     "Genre":"Adventure , Comedy",
//     "Synopsis":"Cursus at sit eget tortor sit praesent molestie vulputate purus. Et eget mattis elit ipsum. Sit tempus consectetur eu ipsum diam dictum amet. Vel orci risus id proin sed aliquet platea sapien. Pretium velit tempus integer tempor, nulla. Venenatis, vitae posuere id amet, in faucibus diam gravida sed. Nunc cras dictum tristique vel. Congue scelerisque fringilla est quis neque ac sagittis dui viverra. Aliquet nisl sagittis aliquam enim sit id cursus. At adipiscing tellus massa lectus sed.",
//     "Tags":["Action","Fiction"],
//     "Chapters":[
//         {
//             "Chapter_no":"1",
//             "Chapter_name":"hshshs",
//             "Chapter_text":"Cursus at sit eget tortor sit praesent molestie vulputate purus. Et eget mattis elit ipsum. Sit tempus consectetur eu ipsum diam dictum amet. Vel orci risus id proin sed aliquet platea sapien. Pretium velit tempus integer tempor, nulla. Venenatis, vitae posuere id amet, in faucibus diam gravida sed. Nunc cras dictum tristique vel. Congue scelerisque fringilla est quis neque ac sagittis dui viverra. Aliquet nisl sagittis aliquam enim sit id cursus. At adipiscing tellus massa lectus sed.",
//             "Last_update":"22-03-2002"
//         },
//         {
//             "Chapter_no":"2",
//             "Chapter_name":"hshshs",
//             "Chapter_text":"Cursus at sit eget tortor sit praesent molestie vulputate purus. Et eget mattis elit ipsum. Sit tempus consectetur eu ipsum diam dictum amet. Vel orci risus id proin sed aliquet platea sapien. Pretium velit tempus integer tempor, nulla. Venenatis, vitae posuere id amet, in faucibus diam gravida sed. Nunc cras dictum tristique vel. Congue scelerisque fringilla est quis neque ac sagittis dui viverra. Aliquet nisl sagittis aliquam enim sit id cursus. At adipiscing tellus massa lectus sed.",
//             "Last_update":"22-03-2002"
//         }

//     ],
//     "thumbnail":"https://xyz.com",
//     "Ratings":[ ],
//     "Views":[],
//     "Likes":[],
//     "Reviews":[
//         {
//             "User_id":"999i9i",
//             "date":"22-03-2002",
//             "Review":"lorem ipsum de color sit"
            
//         },
//         {
//             "User_id":"999i94",
//             "date":"22-03-2002",
//             "Review":"lorem ipsum de color sit"
//         },
//         {
//             "User_id":"999i5i",
//             "date":"22-03-2002",
//             "Review":"lorem ipsum de color sit"
//         }
//     ]

// }





