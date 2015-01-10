var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('hM6OlbcTpHE7fYJp-GQNsw');

var fs = require('fs');
var ejs = require('ejs'); 
var FeedSub = require('feedsub');
 
var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8'); 
var blogContent = new FeedSub('http://alicekindheart.github.io/atom.xml', {
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
      latestPosts.push(post);
    }
  })

  csvData = csvParse(csvFile);
  csvData.forEach(function(row){
    firstName = row["firstName"];
    lastName = row["lastName"];
    monthsSinceContact = row["monthsSinceContact"];
    emailAddress = row["emailAddress"];
    copyTemplate = emailTemplate;

     var customizedTemplate = ejs.render(copyTemplate,
      {firstName: firstName,
       monthsSinceContact: monthsSinceContact,
       latestPosts: latestPosts,
     }) 

   sendEmail(firstName + " " + lastName, emailAddress, "Alice Kindheart", "moonstonecowgirl@gmail.com", "I learned how to send spam!!", customizedTemplate);
  // console.log(customizedTemplate);
  })

 
})



function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      // console.log(message);
      // console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};