const mongoose = require('mongoose');
const ComplaintReport = require('../models/ComplaintReport');

async function seed() {
  await mongoose.connect('mongodb://localhost:27018/campus_complaints');

  // Normal, non-anonymous lost item report
  await ComplaintReport.create({
    postgresComplaintId: 1,
    category: 'lost_item',
    description: 'Blue Wildcraft backpack, lost near the canteen',
    location: 'Canteen',
    filedByUserId: 101
  });

  // Anonymous ragging complaint — note: no filedByUserId field at all
  await ComplaintReport.create({
    postgresComplaintId: 2,
    category: 'ragging',
    description: 'Incident reported in Block C corridor',
    isAnonymous: true
    // filedByUserId intentionally omitted
  });

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});