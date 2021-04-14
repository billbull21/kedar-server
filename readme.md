IT'S EXPRESS SETUP APP.

include table user, refresh_tokens

NOTE : please, make sure you have a database to use.

STEP TO CLONE AND RUN THIS PROJECT.
1). npm install
2). rename .env.sample and adjust with your own setting.
3). run -> npx sequelize db:migrate (if you wanna change the property in table user please edit in the models n migrations)
4). and voila.

ADD NOTE : please adjust the name entity in package-lock.json, package.json and www bin