const {task}=require("hardhat/config");

task("Compile","This task is for compiling all contracts",async ()=>{
    const {contracts} =await compile();
    console.log(`Compiled ${contracts.length} contract`);
})

module.exports={}