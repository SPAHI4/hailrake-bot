pnpm build-aws

cp package.json build/

# copy assets dir recursively
cp -r assets build/

cd build

zip -r ../lambda.zip *

cd ..

aws lambda update-function-code --function-name hailrake-bot-production --zip-file fileb://lambda.zip