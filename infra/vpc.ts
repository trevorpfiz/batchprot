export const vpc = new sst.aws.Vpc('MyVpc', {
  nat: 'ec2', // For Lambda functions to access internet / S3
});
