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

// KONSEP: Objek Dasar, Date, filter()
const userProfile = {
  name: 'User',
  joinDate: new Date().toISOString(),
  totalHabits: 0,
  completedThisWeek: 0,

  // Method untuk update statistik berdasarkan habits
  // KONSEP: filter() untuk menghitung completed habits
  updateStats(habits) {
    this.totalHabits = habits.length;
    // KONSEP: filter() - filter habits yang completed this week
    this.completedThisWeek = habits.filter((h) =>
      h.isCompletedThisWeek()
    ).length;
  },

  // Method untuk menghitung berapa hari sejak join
  // KONSEP: Date manipulation
  getDaysJoined() {
    const joinDate = new Date(this.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
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

// KONSEP: Class, Array, Date, filter(), find()
class Habit {
  constructor(name, targetFrequency) {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = [];
    this.createdAt = new Date().toISOString();
  }

  // Method untuk menandai habit selesai hari ini
  // KONSEP: Array manipulation, Date, find()
  markComplete() {
    const today = new Date().toDateString();
    // KONSEP: find() - cek apakah sudah complete hari ini
    const alreadyCompleted = this.completions.find((c) => {
      return new Date(c).toDateString() === today;
    });

    // KONSEP: Nullish coalescing
    if (alreadyCompleted ?? false) {
      return false;
    }

    this.completions.push(new Date().toISOString());
    return true;
  }

  // Method untuk mendapatkan jumlah completion minggu ini
  // KONSEP: filter(), Date
  getThisWeekCompletions() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // KONSEP: filter() - filter completion dari minggu ini
    return this.completions.filter((c) => {
      const completionDate = new Date(c);
      return completionDate >= startOfWeek;
    }).length;
  }

  // Method untuk cek apakah habit sudah complete minggu ini
  isCompletedThisWeek() {
    return this.getThisWeekCompletions() >= this.targetFrequency;
  }

  // Method untuk menghitung persentase progress
  getProgressPercentage() {
    const completions = this.getThisWeekCompletions();
    const percentage = (completions / this.targetFrequency) * 100;
    return Math.min(percentage, 100);
  }

  // Method untuk mendapatkan status habit
  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }

  // Helper method untuk generate progress bar
  getProgressBar() {
    const percentage = this.getProgressPercentage();
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;

    const filled = '█'.repeat(filledBlocks);
    const empty = '░'.repeat(emptyBlocks);

    return `${filled}${empty} ${Math.round(percentage)}%`;
  }
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

function displaySeparator(char = '=', length = 50) {
  console.log(char.repeat(length));
}

function displayBanner() {
  displaySeparator();
  console.log('[ WELCOME TO HABIT TRACKER CLI ]');
  displaySeparator();
}

// TODO: Buat function displayMenu()
function displayMenu() {
  displaySeparator();
  console.log('HABIT TRACKER - MAIN MENU');
  displaySeparator();
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
  displaySeparator();
}

// TODO: Buat async function handleMenu(tracker)
async function handleMenu(tracker) {}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()
async function main() {
  displayBanner();
  displayMenu();

  testUserProfile();
  testHabitClass();
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

function testHabitClass() {
  displaySeparator();
  console.log('TESTING HABIT CLASS');
  displaySeparator();

  const habit1 = new Habit('Minum Air 8 Gelas', 7);
  console.log('Habit dibuat:', habit1.name);
  console.log('Target:', habit1.targetFrequency + 'x/minggu');
  console.log('Status:', habit1.getStatus());
  console.log('Progress:', habit1.getProgressPercentage() + '%');
  console.log('Progress Bar:', habit1.getProgressBar());
  console.log();

  // Mark complete
  console.log('Menandai habit selesai...');
  habit1.markComplete();
  console.log('Hari ke-1 selesai!');
  console.log('Status:', habit1.getStatus());
  console.log('Progress:', habit1.getProgressPercentage() + '%');
  console.log('Progress Bar:', habit1.getProgressBar());
  console.log();

  const result = habit1.markComplete();
  console.log(
    'Coba mark lagi:',
    result ? 'Berhasil' : 'Gagal (sudah di-mark hari ini)'
  );
  console.log();

  // Simulasi beberapa hari
  console.log('Simulasi beberapa hari...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  habit1.completions.push(yesterday.toISOString());

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  habit1.completions.push(twoDaysAgo.toISOString());

  console.log('Total minggu ini:', habit1.getThisWeekCompletions() + 'x');
  console.log('Status:', habit1.getStatus());
  console.log('Progress:', habit1.getProgressPercentage() + '%');
  console.log('Progress Bar:', habit1.getProgressBar());
  console.log();

  // habit selesai
  const habit2 = new Habit('Olahraga', 3);
  habit2.completions = [
    new Date().toISOString(),
    new Date(Date.now() - 86400000).toISOString(),
    new Date(Date.now() - 172800000).toISOString(),
  ];

  console.log('Habit 2:', habit2.name);
  console.log('Total minggu ini:', habit2.getThisWeekCompletions() + 'x');
  console.log('Status:', habit2.getStatus());
  console.log('Progress:', habit2.getProgressPercentage() + '%');
  console.log('Progress Bar:', habit2.getProgressBar());
}
