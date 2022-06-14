import boto3
import botocore
from .config import Config

# These are the allowed file types, edit this part to fit your needs
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'svg'}

s3 = boto3.client(
    "s3",
    # aws_access_key_id=Config.S3_KEY,
    # aws_secret_access_key=Config.S3_SECRET
    endpoint_url="http://localstack:4566"
)


def upload_file_to_s3(file, bucket_name, acl="public-read"):
    try:
        s3.upload_fileobj(file,
                          bucket_name,
                          file.filename,
                          ExtraArgs={
                              "ACL": acl,
                              "ContentType": file.content_type
                          })

    except Exception as e:
        # This is catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return e

    return f"{Config.S3_LOCATION}{file.filename}"


def allowed_file(filename):
    return '.' in filename and \
        filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS
