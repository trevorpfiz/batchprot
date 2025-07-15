/** biome-ignore-all lint/correctness/noUndeclaredVariables: sst */
export const vpc = new sst.aws.Vpc('MyVpc', {
  bastion: true, // Will let us connect to the VPC from our local machine
  nat: 'ec2', // For Lambda functions to access internet / S3
});
