/* eslint-disable */
function create_random_time_blocks (block_number, max_time) {
  var time_blocks = []
  var inner_block
  for (var i = 0; i < block_number; i++) {
    inner_block = { capacity: Math.floor(Math.random() * (max_time - 1)) + 1,
      assignments: [] }
    time_blocks.push(inner_block)
  }
  return time_blocks
}

function time_remaining (time_block) {
  var time = 0
  time_block.assignments.forEach(assignment => {
    time += assignment.duration
  })
  return time_block.capacity - time
}

// finds the first time block that will fit the given assignment
// makes new block if none are found
function allocate (assignment_list, max_time, block_number) {
  var time_blocks = create_random_time_blocks(block_number, max_time)

  var time_block_found

  assignment_list.forEach(assignment => {
    time_block_found = false
    for (var i = 0; i < time_blocks.length; i++) // look for first time_block that fits
    {
      if (time_remaining(time_blocks[i]) >= assignment.duration) {
        time_blocks[i].assignments.push(assignment)
        time_block_found = true
        break
      }
    }

    if (!time_block_found)// panic if no blocks are found
    {
      console.log('Unable to allocate, exiting')
      Process.exit(0)
    }
  })

  return time_blocks
}

function number_populated (schedule) {
  var populated = 0
  schedule.forEach(time_block => {
    if (time_block.assignments.length > 0) { populated++ }
  })
  return populated
}

function print_allocation (allocation) {
  allocation.forEach(time_block => {
    process.stdout.write(`${time_block.capacity}`)
    console.log(time_block.assignments)
  })
}

exports.allocate = allocate
exports.allocations = number_populated
exports.print = print_allocation
