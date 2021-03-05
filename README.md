# AWS S3 Demo with Flask-React Stack

* PostgreSQL
* Flask
* React

## Set Up

**Packages to install in your backend**

* [boto3](https://github.com/boto/boto3)

```bash
pipenv install boto3
```

Don't forget to run `pipenv lock -r > requirements.txt` after installing boto3!

**Create your AWS User and Bucket**

1. Navigate to aws.amazon.com and `Create an AWS Account`.
2. Once signed into the AWS console, search for `S3: Scalable Storage in the Cloud` and click the link to go to the S3 Management Console
3. Once there, click `Create Bucket`
4. In the Create Bucket form, enter a name, choose a region, and leave all other options as default.
    * You can opt to make all of your content in this bucket public by unchecking the checkbox by `Block all public access` AND checking the acknowledgment checkbox that shows up below.
    * Create the bucket
    * You're going to need the name of your bucket in a second, so you'll want to keep this tab with your bucket open.
5. In the top search bar, search for `IAM: Manage access to AWS resources` and open the link in a new tab. This should take you to the Identity and Access Management (IAM) Console.
6. Once there, click `Users` under `Access management` in the left sidebar.
7. Click `Add user`.
8. Name the user whatever you like and give the user `Programmatic access`. Click `Next: Permissions`
9. Here is where you'll set up the security policy for your new user.
    * Click `Attach existing policies directly`
    * Click `Create Policy`. This will open up in a new tab.
10. In the new tab, click on the `JSON` tab and paste the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1420751757000",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "arn:aws:s3:::<NAME OF BUCKET>/*"
    }
  ]
}
```
* Make sure to replace `<NAME OF BUCKET>` with the name of your bucket.
* Click `Next: Tags`
* Click `Next: Review`
* Give the policy a name (maybe something like `s3-access-to-name-of-project`).
* Click `Create policy`

11. After creating the policy, go back to the IAM Management Console where you were creating a user.
12. Click the refresh icon in the middle of the screen above the table of policies.
13. Search for your new policy and check the checkbox to the left of it.
14. Click `Next: Tags`
15. Click `Next: Review`
16. Review your new user and make sure the policy you've attached is correct. Then click `Create user`.
17. You will now get the `Access Key ID` and the `Secret Access Key`. Make sure to save both somewhere safe. You can (should) download the `.csv` file. **Store this somewhere safe on your computer.**
    * Note: If you don't somehow get your keys here, you will have to generate new keys through IAM because AWS will not give you an old secret key after this page.

## Set up AWS S3 in your backend

#### `.env`

Now that you have your AWS keys, you will need to set them in your `.env` file. 

```env

S3_BUCKET_NAME=<your bucket name>
S3_ACCESS_KEY=<your aws access key>
S3_SECRET_ACCESS_KEY=<your aws secret access key>
```
Make sure that these are set in your BACKEND `.env` file (the one in the root of your project). Now is  a very good time to double-check that your `.env` is listed in your backend `.gitignore`.

*Note: You will need to provide these keys to Heroku when you are ready to deploy.

#### `config.py`

Now that we've added our AWS Keys to our `.env`, we will want to access them through the rest of our app.  To do that, add the following lines to your Config class inside your `config.py` file. 

```python
S3_BUCKET = os.environ.get("S3_BUCKET_NAME")
S3_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET = os.environ.get("S3_SECRET_ACCESS_KEY")
S3_LOCATION = f"http://{S3_BUCKET}.s3.amazonaws.com/"
```

  Your entire `config.py` file should now look something like this:

```python
import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_ECHO = True

    S3_BUCKET = os.environ.get("S3_BUCKET_NAME")
    S3_KEY = os.environ.get("S3_ACCESS_KEY")
    S3_SECRET = os.environ.get("S3_SECRET_ACCESS_KEY")
    S3_LOCATION = f"http://{S3_BUCKET}.s3.amazonaws.com/"
```

#### `aws_s3.py`

Make a file called `aws_s3.py` as a module inside of your Flask `app` directory.  Copy the following code inside: 

```python
import boto3, botocore
from .config import Config


s3 = boto3.client(
   "s3",
   aws_access_key_id=Config.S3_KEY,
   aws_secret_access_key=Config.S3_SECRET
)
```

In here, you will see that you are using the `boto3.client` method to connect to your AWS S3 bucket. This works because we are able to pass it your AWS Keys that we are grabbing from your Config object, `Config.S3_KEY` and `Config.S3_SECRET`.  

Now copy this into your file:

```python

def upload_file_to_s3(file, bucket_name, acl="public-read"):

    try:

        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={
                "ACL": acl,
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        # This is a catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return e
```

Here we are defining our function that will allow you to store a file to your S3 bucket.  Notice that it takes in a `file`, `bucket_name` and an argument called `acl` that is set to `"public-read"` by default.  Because of this default param, when we are ready to call this function we only need to pass in our `file` and our `bucket_name`.  

Also note that inside our function we are calling the `s3.upload_fileobj` method.  In addition to passing this method our `file` and `bucket_name`, we are giving it an `ExrtaArgs` object that contains our POST request headers.  Thanks to these `ExtraArgs` we do not need to specify any request headers when making our POST request. 

Lastly, copy the following return statement to the end of your function. This return statement will give us the URL to the file we've just uploaded to our bucket. 

```python
return f"{Config.S3_LOCATION}{file.filename}"
```


By now, your whole `aws_s3.py` file should look like this:

```python

import boto3, botocore
from .config import Config


s3 = boto3.client(
   "s3",
   aws_access_key_id=Config.S3_KEY,
   aws_secret_access_key=Config.S3_SECRET
)

def upload_file_to_s3(file, bucket_name, acl="public-read"):

    try:

        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={
                "ACL": acl,
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        # This is a catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return e


    return f"{Config.S3_LOCATION}{file.filename}"
```


#### If you haven't already:
### MAKE SURE TO GITIGNORE YOUR .ENV FILE

## Sending Your POST request

Now it's time to set up our POST request by way of a Redux thunk.  Hopefully you know by how to submit a form from your React component through to a thunk!  The form we are receiving should contain the file we are intending to upload along with all other necessary fields to persist to our database.  An example looks like this: 

```javascript
export const uploadFile = (fileForm) => async (dispatch) => {
    const {
        user_id, 
        /* all,
           other,
           form,
           fields, */
           file // this is the file for uploading
    } = fileForm
}
```
Here we destructure the file and associated form fields from the initial form submission.  Next we will package them up in a new upload-worthy style form.  

```javascript
 const form = new FormData()
 form.append('user_id', user_id)
 // repeat as necessary  for each required form field
 form.append('file', file)
```

We've now created a new FormData object and appended our file and associated form fiels.  This object is now ready to submit to our backend to get persisted in our data base.  We will do so by setting the following:

```javascript
const res = await fetch('/api/<your_api_route>', {
    method: "POST", 
    body: form
})
```

Remember how we already prescribed our request headed back in our `aws_s3.py`?  No need to set any here!  


Your overall thunk should be looking like this (with `<your_api_route>` replaced by your actual API route): 

```javascript
export const uploadFile = (fileForm) => async (dispatch) => {
    const {
        user_id, 
        /* all,
           other,
           form,
           fields, */
           file // this is the file for uploading
    } = fileForm

    const form = new FormData()
    form.append('user_id', user_id)
    // repeat as necessary  for each required form field
    form.append('file', file)

    const res = await fetch('/api/<your_api_route>', {
    method: "POST", 
    body: form
    })
}
```

We'll let you figure out what to do with the rest of the thunk, but for now she's ready to hit your backend! 

## Setting Your Route 

Here we will set up our route that will call our `upload_file_to_s3` function that we've defined in our `aws_s3.py` file. We will  then push the resulting URL to our database.  

If you haven't already, create a `route` file inside the `api` directory of your app.  The path should look something like this:  `app/api/<you_route_file.py>`

Begin by including these import statements along with all of your usual ones.

```python

from flask import Blueprint, request
from flask_login import login_required
import boto3
import botocore
from ..config import Config
from ..aws_s3 import *
from app.models import db, <Your_Model>
#any other imports as needed
```
Be sure to replace `<Your_Model>` with the name of the Model you will be persisting to.  

Next we will define our route. For the sake of this walkthrough let's call it `file_route`.  This where we will call our file uploading function as well receive the file we will be passing into it.  This is where the magic happens! 

```python

file_route = Blueprint('file', __name__)

  #Don't forget to register your Blueprint

@file_route.route('/', methods=["POST"])
@login_required
def upload_file:
    if "file" not in request.files:
        return "No user_file key in request.files"

    file = request.files["file"]
    
    if file:
        file_url = upload_file_to_s3(file, Config.S3_BUCKET)
        # create an instance of <Your_Model>
        file = File(
            user_id=request.form.get('user_id')
            #extract any form fields you've appended to the 
            #body of your POST request 
            #i.e.
            url=file_url
        )  
        db.session.add(file)  
        db.session.commit()
        return file.to_dict()  
     else: return No File Attached! 
```
Here we've used Flask's request object to parse our POST request, which allows us to pass our intended file through the `upload_file_to_s3` method and retrieve our AWS URL.  We can further use `request.form.get('<field_name>')` to parse out each incoming form field and add them to our Model instance.  Finally we pass in our `file_url` that we received from our S3 Bucket and assign it to the specified column in our model. 

Your whole `route.py` file should look something like this: 

```python

from flask import Blueprint, request
from flask_login import login_required
import boto3
import botocore
from ..config import Config
from ..aws_s3 import *
from app.models import db, <Your_Model>
#any other imports as needed

file_route = Blueprint('file', __name__)

  #Don't forget to register your Blueprint

@file_route.route('/', methods=["POST"])
@login_required
def upload_file:
    if "file" not in request.files:
        return "No user_file key in request.files"

    file = request.files["file"]
    
    if file:
        file_url = upload_file_to_s3(file, Config.S3_BUCKET)
        # create an instance of <Your_Model>
        file = File(
            user_id=request.form.get('user_id')
            #extract any form fields you've appended to the 
            #body of your POST request 
            #i.e.
            url=file_url
        )  
        db.session.add(file)  
        db.session.commit()
        return file.to_dict()  
     else: return No File Attached! 

```

And that's It!  If you did everything correctly you should be able to start storing files to your S3 Bucket and pushing their corresponding URL into your database.  

## Public File Uploads

If you absolutely don't want your files to be publicly available to just any user, then you want your files to be private. If you don't care if users are able to access those files, then you can set up the files to be publicly readable.

Public upload is recommended for most of the use cases for your portfolio projects.

### Public Files

How to set up uploading and reading public files on the backend.

#### Public File Write Configuration


