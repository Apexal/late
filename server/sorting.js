var allocator = require("./allocate.js");

//CHRASTERISTIC VAIRABLES
//controls the input to the algorithm indimensions that vary freely in a production context

//maximum amount of time in particular time block
const BLOCK_SIZE = 15;

//number of total time blocks, 30 is way more that is needed but It gives enough room that the program wont crash
const BLOCK_NUMBER = 30;

//number of total assignments
const ASSIGNMENTS = 10;






function create_random_assignments(assignment_number,max_duration)
{
    var assignments = [];
    for(var i = 0; i < assignment_number; i++)
    {
        assignments.push(
            {duration: Math.floor(Math.random()*(max_duration-1))+1, //1..max_duration
            priority: Math.floor(Math.random()*10)+1,
            time_remaining: Math.floor(Math.random()*10)+1});
    }
    return assignments;
}

var raw_assignments = create_random_assignments(ASSIGNMENTS,BLOCK_SIZE);

console.log("random assignments before priority sorting");
console.log(raw_assignments);
console.log("");





//the "instant_priority" is directly proportional the given priority
//and inversely proprotional to the time before the deadline
function priority_compare(a,b)
{
    //sort with decreasing order
    return (b.priority/b.time_remaining)-(a.priority/a.time_remaining);
}

var prioritized_assignments = raw_assignments.sort(priority_compare);

console.log("assignments sorted based on instant priority");
console.log(prioritized_assignments);
console.log("");








var allocated_assignments = allocator.allocate(prioritized_assignments,BLOCK_SIZE,BLOCK_NUMBER);
console.log(`FFD allocated assignments: ${ASSIGNMENTS} assignments, ${allocator.allocations(allocated_assignments)} blocks`);
allocator.print(allocated_assignments);
