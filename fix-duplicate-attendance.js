const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuj_societies', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const EventAttendance = require('./src/models/eventAttendance');

async function fixDuplicateAttendanceRecords() {
  try {
    console.log('Starting to fix duplicate attendance records...');
    
    // Step 1: Find all records with null ID
    const nullIdRecords = await EventAttendance.find({ ID: null });
    console.log(`Found ${nullIdRecords.length} records with null ID`);
    
    if (nullIdRecords.length > 0) {
      // Delete all records with null ID
      const deleteResult = await EventAttendance.deleteMany({ ID: null });
      console.log(`Deleted ${deleteResult.deletedCount} records with null ID`);
    }
    
    // Step 2: Find all records with duplicate IDs
    const duplicateIds = await EventAttendance.aggregate([
      { $group: { _id: "$ID", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`Found ${duplicateIds.length} duplicate ID groups`);
    
    for (const duplicate of duplicateIds) {
      const records = await EventAttendance.find({ ID: duplicate._id }).sort({ CreatedAt: 1 });
      console.log(`Processing ${records.length} records with ID: ${duplicate._id}`);
      
      // Keep the first (oldest) record, delete the rest
      for (let i = 1; i < records.length; i++) {
        await EventAttendance.findByIdAndDelete(records[i]._id);
        console.log(`Deleted duplicate record ${i + 1} of ${records.length}`);
      }
    }
    
    // Step 3: Verify no duplicates remain
    const remainingDuplicates = await EventAttendance.aggregate([
      { $group: { _id: "$ID", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ All duplicate records have been cleaned up!');
    } else {
      console.log(`⚠️  Warning: ${remainingDuplicates.length} duplicate groups still remain`);
    }
    
    // Step 4: Check for any remaining null IDs
    const remainingNullIds = await EventAttendance.countDocuments({ ID: null });
    if (remainingNullIds === 0) {
      console.log('✅ No null IDs remaining');
    } else {
      console.log(`⚠️  Warning: ${remainingNullIds} records still have null IDs`);
    }
    
    console.log('Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing duplicate records:', error);
    process.exit(1);
  }
}

fixDuplicateAttendanceRecords();
