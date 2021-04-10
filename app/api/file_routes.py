from flask import Blueprint, request
from flask_login import login_required

from app.config import Config
from app.aws_s3 import upload_file_to_s3
from app.models import db, File

file_routes = Blueprint('file', __name__)


@file_routes.route('', methods=["POST"])
@login_required
def upload_file():
    if "file" not in request.files:
        return "No file key in request.files"

    file = request.files["file"]

    if file:
        file_url = upload_file_to_s3(file, Config.S3_SECRET)
        file = File(
            user_id=request.form.get('user_id'),
            url=file_url,
        )
        db.session.add(file)
        db.session.commit()
        return file.to_dict()
    return "No File Attached!"
