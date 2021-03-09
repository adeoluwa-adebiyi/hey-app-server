import faker from "faker";
import fs from "fs";
import path from "path";

const create_fake_user = (index:number)=>{

    /*
     * 
     *
    
    private id: number;

    private firstname: string;

    private lastname: string;

    private dob: Date;

    private email: string
     
    */

    const date = faker.date.past();
    return {
        // id:index+1,
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        dob: `${date.getFullYear()}-${(date.getMonth()+1)>=9?(date.getMonth()+1):("0"+(date.getMonth()+1).toString())}-${date.getDate()}`,
        email: faker.internet.email(),
        password: "easylogin",
        username: faker.name.firstName().toLowerCase(),
        pic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVkEgWml5fPBeNtfwwI2_RkWCWE5dRUW9Riw&usqp=CAU"
    }
}

var list = new Array();

for(let start:number=1; start < 10; start++){
    list.push(create_fake_user(start));
}

fs.writeFile(path.resolve("./app/data/fixtures/users.fixture.json"),JSON.stringify({users: list}),(err)=>{
    if(err){
        console.log("Fixture export failed")
    }else{
        console.log("Fixture export successful");
    }
});