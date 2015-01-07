var fs = require('fs');
var ejs = require('ejs');
 
var FeedSub = require('feedsub');
 
var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
 
 
var blogContent = new FeedSub('http://AliceKindheart.github.io/atom.xml', {
        emitOnStart: true
});
 
 
var latestPosts = [];
 
 
function csvParse(csvFile){
    var arrayOfObjects = [];
    var arr = csvFile.split("\n");
    var newObj;
    keys = arr.shift().split(",");
    arr.forEach(function(contact){
        contact = contact.split(",");
        newObj = {};
        
        for(var i =0; i < contact.length; i++){
            newObj[keys[i]] = contact[i];
        }
        arrayOfObjects.push(newObj);
    })
    return arrayOfObjects;
}
 
blogContent.read(function(err,blogPosts){
  blogPosts.forEach(function(post){
    var now =  new Date();
    var cutoff = new Date();
    cutoff.setDate(now.getDate()-7);
    var blogDate = new Date(post.published);

    if(blogDate>cutoff){
      latestPosts.push(post.title);
    }
  })

  csvData = csvParse(csvFile);
  csvData.forEach(function(row){
    firstName = row["firstName"];
    monthsSinceContact = row["monthsSinceContact"];
    copyTemplate = emailTemplate;
    var customizedTemplate = ejs.render(copyTemplate,
      {firstName: csvData["firstName"],
       monthsSinceContact: csvData["monthsSinceContact"],
       latestPosts: latestPosts
     })  
   console.log(customizedTemplate);
  })
})