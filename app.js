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
const SEPARATOR_LENGTH = 50;
const SEPARATOR_CHAR = '=';

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
    startOfWeek.setDate(now.getDate() - (DAYS_IN_WEEK - 1));
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

// KONSEP: Class, Array methods, setInterval, JSON, Nullish coalescing
class HabitTracker {
  // Constructor untuk inisialisasi
  constructor() {
    this.habits = [];
    this.reminderInterval = null;
    this.loadFromFile();
  }

  // Method untuk menambah habit baru
  // KONSEP: Array push, Nullish coalescing
  addHabit(name, frequency) {
    // KONSEP: Nullish coalescing - provide default values
    const habitName = name ?? 'Unnamed Habit';
    const targetFrequency = frequency ?? 1;

    const habit = new Habit(habitName, targetFrequency);
    this.habits.push(habit);
    this.saveToFile();

    console.log(`\nHabit "${habitName}" berhasil ditambahkan.`);
  }

  // Method untuk menandai habit selesai
  // KONSEP: Array indexing, Nullish coalescing
  completeHabit(habitIndex) {
    // KONSEP: Nullish coalescing - safe array access
    const habit = this.habits[habitIndex - 1] ?? null;

    if (!habit) {
      console.log('\nHabit tidak ditemukan.');
      return;
    }

    const success = habit.markComplete();
    if (success) {
      this.saveToFile();
      console.log(`\nHabit "${habit.name}" berhasil diselesaikan hari ini.`);
    } else {
      console.log(`\nHabit "${habit.name}" sudah diselesaikan hari ini.`);
    }
  }

  // Method untuk menghapus habit
  // KONSEP: Array splice
  deleteHabit(habitIndex) {
    // KONSEP: Nullish coalescing
    const habit = this.habits[habitIndex - 1] ?? null;

    if (!habit) {
      console.log('\nHabit tidak ditemukan.');
      return;
    }

    const habitName = habit.name;
    this.habits.splice(habitIndex - 1, 1);
    this.saveToFile();

    console.log(`\nHabit "${habitName}" berhasil dihapus.`);
  }

  // Method untuk menampilkan profil user
  // KONSEP: Object methods, Date
  displayProfile() {
    userProfile.updateStats(this.habits);

    displaySeparator(true);
    console.log('USER PROFILE');
    displaySeparator();
    console.log(`Nama: ${userProfile.name}`);
    console.log(`Bergabung: ${userProfile.getDaysJoined()} hari yang lalu`);
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Selesai Minggu Ini: ${userProfile.completedThisWeek}`);
    displaySeparator(false, true);
  }

  // Method untuk menampilkan habits dengan filter
  // KONSEP: filter(), forEach()
  displayHabits(filter) {
    let filteredHabits = this.habits;
    let title = 'SEMUA KEBIASAAN';

    // KONSEP: filter() berdasarkan tipe
    if (filter === 'active') {
      filteredHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
      title = 'KEBIASAAN AKTIF';
    } else if (filter === 'completed') {
      filteredHabits = this.habits.filter((h) => h.isCompletedThisWeek());
      title = 'KEBIASAAN SELESAI';
    }

    displaySeparator(true);
    console.log(title);
    displaySeparator();

    if (filteredHabits.length === 0) {
      console.log('Tidak ada kebiasaan untuk ditampilkan.');
    } else {
      // KONSEP: forEach() untuk iterasi
      filteredHabits.forEach((habit, index) => {
        const originalIndex = this.habits.indexOf(habit) + 1;
        console.log(`\n${originalIndex}. [${habit.getStatus()}] ${habit.name}`);
        console.log(`   Target: ${habit.targetFrequency}x/minggu`);
        console.log(
          `   Progress: ${habit.getThisWeekCompletions()}/${
            habit.targetFrequency
          } (${Math.round(habit.getProgressPercentage())}%)`
        );
        console.log(`   Progress Bar: ${habit.getProgressBar()}`);
      });
    }

    displaySeparator(true, true);
  }

  // Method untuk demo menampilkan habits dengan while loop
  // KONSEP: while loop
  displayHabitsWithWhile() {
    displaySeparator(true);
    console.log('DEMO: MENAMPILKAN HABITS DENGAN WHILE LOOP');
    displaySeparator();

    if (this.habits.length === 0) {
      console.log('Tidak ada kebiasaan untuk ditampilkan.');
    } else {
      // KONSEP: while loop
      let i = 0;
      while (i < this.habits.length) {
        const habit = this.habits[i];
        console.log(`${i + 1}. ${habit.name} - ${habit.getStatus()}`);
        i++;
      }
    }

    displaySeparator(false, true);
  }

  // Method untuk demo menampilkan habits dengan for loop
  // KONSEP: for loop
  displayHabitsWithFor() {
    displaySeparator(true);
    console.log('DEMO: MENAMPILKAN HABITS DENGAN FOR LOOP');
    displaySeparator();

    if (this.habits.length === 0) {
      console.log('Tidak ada kebiasaan untuk ditampilkan.');
    } else {
      // KONSEP: for loop
      for (let i = 0; i < this.habits.length; i++) {
        const habit = this.habits[i];
        console.log(`${i + 1}. ${habit.name} - ${habit.getStatus()}`);
      }
    }

    displaySeparator(false, true);
  }

  // Method untuk menampilkan statistik
  // KONSEP: map(), filter(), forEach()
  displayStats() {
    userProfile.updateStats(this.habits);

    displaySeparator(true);
    console.log('STATISTIK KEBIASAAN');
    displaySeparator();

    // KONSEP: map() - transform habit data menjadi array nama
    const habitNames = this.habits.map((h) => h.name);
    console.log(`\nDaftar Habits: ${habitNames.join(', ') || 'Belum ada'}`);

    // KONSEP: filter() - dapatkan active habits
    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    console.log(`Total Habits Aktif: ${activeHabits.length}`);

    // KONSEP: filter() - dapatkan completed habits
    const completedHabits = this.habits.filter((h) => h.isCompletedThisWeek());
    console.log(`Total Habits Selesai: ${completedHabits.length}`);

    // Hitung total completions menggunakan forEach
    let totalCompletions = 0;
    // KONSEP: forEach() untuk aggregate data
    this.habits.forEach((habit) => {
      totalCompletions += habit.getThisWeekCompletions();
    });
    console.log(`Total Penyelesaian Minggu Ini: ${totalCompletions}`);

    // Hitung rata-rata progress
    if (this.habits.length > 0) {
      const totalProgress = this.habits.reduce(
        (sum, h) => sum + h.getProgressPercentage(),
        0
      );
      const avgProgress = totalProgress / this.habits.length;
      console.log(`Rata-rata Progress: ${Math.round(avgProgress)}%`);
    }

    displaySeparator(false, true);
  }

  // Method untuk memulai reminder system
  // KONSEP: setInterval
  startReminder() {
    if (this.reminderInterval) {
      console.log('\nReminder sudah aktif.');
      return;
    }

    // KONSEP: setInterval - reminder setiap 10 detik
    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);

    console.log('\nReminder diaktifkan. Akan muncul setiap 10 detik.');
  }

  // Method untuk menampilkan reminder
  // KONSEP: filter(), find()
  showReminder() {
    // KONSEP: filter() - dapatkan habits yang belum complete hari ini
    const today = new Date().toDateString();
    const incompleteToday = this.habits.filter((habit) => {
      // KONSEP: find() - cek apakah sudah complete hari ini
      const completedToday = habit.completions.find((c) => {
        return new Date(c).toDateString() === today;
      });
      return !completedToday;
    });

    if (incompleteToday.length > 0) {
      const randomHabit =
        incompleteToday[Math.floor(Math.random() * incompleteToday.length)];
      displaySeparator(true);
      console.log(`REMINDER: Jangan lupa "${randomHabit.name}"!`);
      displaySeparator(false, true);
    }
  }

  // Method untuk menghentikan reminder
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('\nReminder dinonaktifkan.');
    } else {
      console.log('\nReminder tidak aktif.');
    }
  }

  // Method untuk menyimpan data ke file
  // KONSEP: JSON.stringify, fs
  saveToFile() {
    try {
      const data = {
        userProfile: userProfile,
        habits: this.habits,
      };

      // KONSEP: JSON.stringify - convert object ke JSON string
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData, 'utf8');
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  }

  // Method untuk load data dari file
  // KONSEP: JSON.parse, fs
  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        // KONSEP: JSON.parse - convert JSON string ke object
        const data = JSON.parse(jsonData);

        // Restore user profile
        Object.assign(userProfile, data.userProfile);

        // Restore habits dengan proper class instances
        this.habits = data.habits.map((habitData) => {
          const habit = new Habit(habitData.name, habitData.targetFrequency);
          Object.assign(habit, habitData);
          return habit;
        });
      }
    } catch (error) {
      console.error('Error loading data:', error.message);
      this.habits = [];
    }
  }

  // Method untuk menghapus semua data
  clearAllData() {
    this.habits = [];
    userProfile.totalHabits = 0;
    userProfile.completedThisWeek = 0;
    this.saveToFile();
    console.log('\nSemua data berhasil dihapus.');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function displaySeparator(topSpace = false, bottomSpace = false) {
  const char = SEPARATOR_CHAR;
  const separator = char.repeat(SEPARATOR_LENGTH);

  const top = topSpace ? '\n' : '';
  const bottom = bottomSpace ? '\n' : '';
  console.log(top + separator + bottom);
}

function displayBanner() {
  displaySeparator();
  console.log('[ WELCOME TO HABIT TRACKER CLI ]');
  displaySeparator();
}

// TODO: Buat function displayMenu()
function displayMenu() {
  displaySeparator(true);
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
  displaySeparator(false, true);
}

// TODO: Buat async function handleMenu(tracker)
async function handleMenu(tracker) {
  let running = true;

  while (running) {
    displayMenu();
    const choice = await askQuestion('Pilih menu (0-9): ');

    switch (choice) {
      case '1':
        tracker.displayProfile();
        break;

      case '2':
        tracker.displayHabits('all');
        break;

      case '3':
        tracker.displayHabits('active');
        break;

      case '4':
        tracker.displayHabits('completed');
        break;

      case '5':
        const habitName = await askQuestion('Nama kebiasaan: ');
        const frequency = await askQuestion('Target per minggu: ');
        tracker.addHabit(habitName, parseInt(frequency) || 1);
        break;

      case '6':
        tracker.displayHabits('all');
        const completeIndex = await askQuestion(
          'Nomor habit yang diselesaikan: '
        );
        tracker.completeHabit(parseInt(completeIndex));
        break;

      case '7':
        tracker.displayHabits('all');
        const deleteIndex = await askQuestion(
          'Nomor habit yang akan dihapus: '
        );
        tracker.deleteHabit(parseInt(deleteIndex));
        break;

      case '8':
        tracker.displayStats();
        break;

      case '9':
        tracker.displayHabitsWithWhile();
        tracker.displayHabitsWithFor();
        break;

      case '0':
        tracker.stopReminder();
        console.log('\nTerima kasih telah menggunakan Habit Tracker.');
        console.log('Data Anda telah tersimpan.\n');
        running = false;
        rl.close();
        break;

      default:
        console.log('\nPilihan tidak valid. Silakan pilih 0-9.\n');
    }

    if (running) {
      await askQuestion('\nTekan Enter untuk melanjutkan...\n');
    }
  }
}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()
async function main() {
  console.clear();

  displayBanner();

  const tracker = new HabitTracker();

  // Tambah data demo jika belum ada data
  if (tracker.habits.length === 0) {
    const addDemo = await askQuestion(
      'Tidak ada data. Tambahkan data demo? (y/n): '
    );
    if (addDemo.toLowerCase() === 'y') {
      tracker.addHabit('Minum Air 8 Gelas', 7);
      tracker.addHabit('Baca Buku 30 Menit', 5);
      tracker.addHabit('Olahraga Pagi', 3);
      console.log('\nData demo berhasil ditambahkan.');
    }
  }

  tracker.startReminder();
  await handleMenu(tracker);
}

// TODO: Jalankan main() dengan error handling
main().catch((error) => {
  console.error('\nFatal Error:', error.message);
  rl.close();
  process.exit(1);
});
