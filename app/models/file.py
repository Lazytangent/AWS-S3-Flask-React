from .db import db


class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    url = db.Column(db.String, nullable=False)

    user = db.relationship("User", back_populates="files")

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.to_simple_dict(),
            "url": self.url,
        }
