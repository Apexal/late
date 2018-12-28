function create_random_time_blocks (block_number, max_time) {
  var time_blocks = [];
  var inner_block;
  for (var i = 0; i < block_number; i++) {
    inner_block = {
      capacity: Math.floor(Math.random() * (max_time - 1)) + 1,
      assignments: []
    };
    time_blocks.push(inner_block);
  }
  return time_blocks;
}
exports.create_random_time_blocks = create_random_time_blocks;
