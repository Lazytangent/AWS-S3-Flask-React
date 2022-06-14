resource "aws_iam_policy" "s3-access-local-bucket" {
  name        = "s3-access-local-bucket"
  description = "Access to S3 Local Bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Stmt1420751757000"
        Effect   = "Allow"
        Action   = ["s3:*"]
        Resource = "arn:aws:s3:::local-bucket/*"
      }
    ]
  })
}

resource "aws_s3_bucket" "local-bucket" {
  bucket = "local-bucket"
}

resource "aws_s3_bucket_acl" "local-bucket-acl" {
  bucket = aws_s3_bucket.local-bucket.id
  acl    = "public-read"
}
