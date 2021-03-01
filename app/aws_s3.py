import boto3
import botocore
from .config import Config

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'svg'}

s3 = boto3.client(
    "s3",
    aws_access_key_id=Config.S3_KEY,
    aws_secret_access_key=Config.S3_SECRET
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
        print("Something Happened: ", e)
        return e

    return f"{Config.S3_LOCATION}{file.filename}"


def allowed_file(filename):
    return '.' in filename and \
        filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validation_errors_to_error_messages(validation_errors):
    """
    Simple function that turns the WTForms validation errors into a simple list
    """
    error_messages = []
    for field in validation_errors:
        for error in validation_errors[field]:
            error_messages.append(f"{field} : {error}")
    return error_messages
