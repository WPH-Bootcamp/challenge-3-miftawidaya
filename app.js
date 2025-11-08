// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Mifta Widaya
// KELAS: WPH-016
// TANGGAL: 7 November 2025
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 seconds
const DAYS_IN_WEEK = 7;
const PROGRESS_BAR_WIDTH = 10;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()
const userProfile = {
  name: '',
  joinDate: '',
  totalHabits: 0,
  completedThisWeek: 0,

  updateStats(habits) {
    this.totalHabits = habits.length;

    this.completedThisWeek = habits.filter((habit) =>
      habit.isCompletedThisWeek()
    ).length;
  },

  getDaysJoined() {
    if (!this.joinDate) return 0;

    const now = new Date();
    const joined = new Date(this.joinDate);
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },
};

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()
class Habit {
  constructor(name) {
    this.name = name;
  }

  markComplete() {
    console.log();
  }
  getThisWeekCompletions() {}
  isCompletedThisWeek() {}
  getProgressPresentage() {}
  getStatus() {}
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// - Constructor
// - Method addHabit(name, frequency)
// - Method completeHabit(habitIndex)
// - Method deleteHabit(habitIndex)
// - Method displayProfile()
// - Method displayHabits(filter)
// - Method displayHabitsWithWhile()
// - Method displayHabitsWithFor()
// - Method displayStats()
// - Method startReminder()
// - Method showReminder()
// - Method stopReminder()
// - Method saveToFile()
// - Method loadFromFile()
// - Method clearAllData()
class HabbitTracker {
  constructor(name) {}

  addHabit(name, frequency) {}
  completeHabit(habitIndex) {}
  deleteHabit(habitIndex) {}
  displayProfile() {}
  displayHabits(filter) {}
  displayHabitsWithWhile() {}
  displayHabitsWithFor() {}
  displayStats() {}
  startReminder() {
    setInterval(() => {
      this.showReminder();
    }, 10000);
  }
  showReminder() {
    console.log('Jangan lupa minum');
  }
  stopReminder() {}
  saveToFile() {}
  loadFromFile() {}
  clearAllData() {}
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

function displayBanner() {
  console.log('[ WELCOME TO HABIT TRACKER CLI ]');
}

function displaySeparator(char = '=', length = 50) {
  console.log(char.repeat(length));
}

// TODO: Buat function displayMenu()
function displayMenu() {
  console.log('\n' + '='.repeat(50));
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('='.repeat(50));
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('='.repeat(50) + '\n');
}

// TODO: Buat async function handleMenu(tracker)
async function handleMenu(tracker) {}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()
async function main() {
  displayBanner();

  testUserProfile();
}

// TODO: Jalankan main() dengan error handling
main();

function testUserProfile() {
  displaySeparator();
  console.log('TESTING USER PROFILE');
  displaySeparator();

  userProfile.name = 'Mifta Widaya';
  userProfile.joinDate = new Date('2025-11-01').toISOString();

  console.log('Nama:', userProfile.name);
  console.log('Join Date:', userProfile.joinDate);
  console.log('Days Joined:', userProfile.getDaysJoined(), 'hari');

  userProfile.updateStats([]);
  console.log('Total Habits:', userProfile.totalHabits);
  console.log('Completed This Week:', userProfile.completedThisWeek);
}
