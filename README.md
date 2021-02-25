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
