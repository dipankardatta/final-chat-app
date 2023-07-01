const AWS = require('aws-sdk');

exports.uploadToS3 = (data, filename) => {
    const BUCKET_NAME = 'expensetrackss';
    const IAM_USER_KEY = 'AKIASH3WOREHVTOHVWVW';
    const IAM_USER_SECRET = '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';

    let s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });

    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3Response) => {
            if (err) {
                console.log('S3 UPLOAD ERROR'); console.log(err);
                reject(err);
                return;
            }
            resolve(s3Response.Location);
        });
    });
};