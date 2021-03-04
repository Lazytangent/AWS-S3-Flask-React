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

#### `awsS3.py`

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

In here, you will see that you are using the `boto3.client` method to connect to your AWS S3 bucket. This works because we are able to pass it your AWS Keys that we are grabbing your Config object, `Config.S3_KEY` and `Config.S3_SECRET`.  

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

Lastly, copy this return statement at the end of your function 

```python
return f"{Config.S3_LOCATION}{file.filename}"
```
This return statement will give us the URL to the file we've just uploaded to our bucket. 

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

## Public File Uploads

If you absolutely don't want your files to be publicly available to just any user, then you want your files to be private. If you don't care if users are able to access those files, then you can set up the files to be publicly readable.

Public upload is recommended for most of the use cases for your portfolio projects.

### Public Files

How to set up uploading and reading public files on the backend.

#### Public File Write Configuration


