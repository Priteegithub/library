const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let bList = [];
const libchoice = (choice = 0) => {
    if (choice == 1) {
        rl.question("enter book name: ", (bname) => {
            let newbookid = Date.now();
            const book = { id: newbookid, name: bname };
            bList.push(book);
            console.log(book)
            menu();
        });
    } else if (choice == 2) {
        rl.question("book id: ", (del) => {
            bList = bList.filter((val, index) => {
                if (val.id == del) {
                    console.log(val);
                    return false;
                }
                return true;
            });
            menu()
        });
    } else if (choice == 3) {
        rl.question("enter book id: ", (bid) => {
            let viewB = bList.filter((val, index) => val.id == bid);
            console.log(viewB[0]);
            menu();
        });
    } else {
        console.log("wrong input");
        menu();
    }
};

const menu = () => {
    rl.question(
        "1. add book \n2. delete book\n3. view book\nchoice: ",
        libchoice
    );
};
menu();
