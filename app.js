// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Mifta Widaya
// KELAS: WPH-016
// TANGGAL: 7 November 2025
// ============================================

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000; // 10 seconds
const DAYS_IN_WEEK = 7;
const SEPARATOR_LENGTH = 50;
const SEPARATOR_CHAR = '=';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
const userProfile = {
  name: 'User',
  joinDate: new Date().toISOString(),
  totalHabits: 0,
  completedThisWeek: 0,

  updateStats(habits) {
    this.totalHabits = habits.length;

    this.completedThisWeek = habits.filter((h) =>
      h.isCompletedThisWeek()
    ).length;
  },

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
class Habit {
  constructor(name, targetFrequency, category = 'Umum') {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.category = category; // dukungan kategori sederhana per kebiasaan
    this.completions = [];
    this.streak = 0; // jumlah hari berturut-turut diselesaikan
    this.lastCompletionDate = null; // disimpan sebagai ISO string
    this.createdAt = new Date().toISOString();
  }

  // Menandai kebiasaan selesai untuk hari ini.
  // Menghindari duplikasi dengan memeriksa penyelesaian di tanggal yang sama.
  markComplete() {
    const today = new Date().toDateString();

    const alreadyCompleted = this.completions.find((c) => {
      return new Date(c).toDateString() === today;
    });

    // Jika sudah ada penyelesaian hari ini, hentikan.
    // Catatan: find() mengembalikan undefined jika tidak ketemu; ?? false menjaga nilai boolean eksplisit.
    if (alreadyCompleted ?? false) {
      return false;
    }

    // Simpan timestamp penyelesaian saat ini
    const nowIso = new Date().toISOString();
    this.completions.push(nowIso);

    // Perbarui streak:
    // - Jika terakhir selesai adalah kemarin, streak + 1
    // - Jika tidak, reset ke 1 (hari ini dianggap awal streak baru)
    try {
      const last = this.lastCompletionDate
        ? new Date(this.lastCompletionDate)
        : null;
      const todayDate = new Date();
      const yesterday = new Date(todayDate);
      yesterday.setDate(todayDate.getDate() - 1);

      if (last && last.toDateString() === yesterday.toDateString()) {
        this.streak = (this.streak || 0) + 1;
      } else {
        this.streak = 1;
      }

      this.lastCompletionDate = nowIso;
    } catch (e) {
      // Jika terjadi error parsing tanggal, amankan dengan reset streak
      this.streak = 1;
      this.lastCompletionDate = nowIso;
    }

    return true;
  }

  // Menghitung jumlah penyelesaian dalam satu "pekan bergerak"
  // Pekan dihitung 7 hari ke belakang termasuk hari ini, mulai pukul 00:00.
  getThisWeekCompletions() {
    const now = new Date();
    const startOfWeek = new Date(now);

    startOfWeek.setDate(now.getDate() - (DAYS_IN_WEEK - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    return this.completions.filter((c) => {
      const completionDate = new Date(c);
      return completionDate >= startOfWeek;
    }).length;
  }

  isCompletedThisWeek() {
    return this.getThisWeekCompletions() >= this.targetFrequency;
  }

  // Menghitung persentase progres terhadap target mingguan.
  getProgressPercentage() {
    const completions = this.getThisWeekCompletions();
    const percentage = (completions / this.targetFrequency) * 100;
    return Math.min(percentage, 100);
  }

  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }

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
class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminderInterval = null;
    this.loadFromFile();
  }

  // Menambah kebiasaan baru dengan validasi nama dan target frekuensi.
  addHabit(name, frequency) {
    const habitNameTrim = typeof name === 'string' ? name.trim() : '';
    if (!habitNameTrim) {
      console.log('\nNama kebiasaan tidak boleh kosong.');
      return false;
    }

    const parsedFreq = Number.isInteger(frequency)
      ? frequency
      : parseInt(frequency, 10);
    const targetFrequency =
      !Number.isNaN(parsedFreq) && parsedFreq > 0 ? parsedFreq : 1;

    // Gunakan nilai yang diberikan, jika null/undefined fallback ke hasil trim
    const habitName = name ?? habitNameTrim;

    // Kategori default adalah 'Umum' bila tidak disediakan saat pembuatan
    const habit = new Habit(habitName, targetFrequency);
    this.habits.push(habit);
    this.saveToFile();

    console.log(`\nHabit "${habitName}" berhasil ditambahkan.`);
    return true;
  }

  // Mengekspor snapshot data saat ini ke file JSON bertimestamp.
  exportData() {
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const outFile = path.join(__dirname, `habits-export-${ts}.json`);
      const data = {
        exportedAt: new Date().toISOString(),
        userProfile,
        habits: this.habits,
      };
      fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf8');
      console.log(`\nData berhasil diekspor ke: ${outFile}`);
      return outFile;
    } catch (err) {
      console.error('Gagal mengekspor data:', err.message);
      return null;
    }
  }

  // Menandai sebuah habit selesai berdasarkan nomor urut yang ditampilkan.
  completeHabit(habitIndex) {
    // Validasi nomor habit: harus integer dan dalam rentang daftar
    if (
      !Number.isInteger(habitIndex) ||
      habitIndex < 1 ||
      habitIndex > this.habits.length
    ) {
      console.log('\nNomor habit tidak valid.');
      return;
    }

    const habit = this.habits[habitIndex - 1];
    const success = habit.markComplete();
    if (success) {
      this.saveToFile();
      console.log(`\nHabit "${habit.name}" berhasil diselesaikan hari ini.`);
    } else {
      console.log(`\nHabit "${habit.name}" sudah diselesaikan hari ini.`);
    }
  }

  deleteHabit(habitIndex) {
    // Validate habitIndex
    if (
      !Number.isInteger(habitIndex) ||
      habitIndex < 1 ||
      habitIndex > this.habits.length
    ) {
      console.log('\nNomor habit tidak valid.');
      return;
    }

    const habitName = this.habits[habitIndex - 1].name;
    this.habits.splice(habitIndex - 1, 1);
    this.saveToFile();

    console.log(`\nHabit "${habitName}" berhasil dihapus.`);
  }

  // Menampilkan profil pengguna dan ringkasan statistik dasar.
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

  displayHabits(filter) {
    let filteredHabits = this.habits;
    let title = 'SEMUA KEBIASAAN';

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
      filteredHabits.forEach((habit, index) => {
        const originalIndex = this.habits.indexOf(habit) + 1;
        console.log(`\n${originalIndex}. [${habit.getStatus()}] ${habit.name}`);
        console.log(
          `   Kategori: ${habit.category || 'Umum'} | Streak: ${
            habit.streak || 0
          }`
        );
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

  // Demo menampilkan kebiasaan menggunakan while-loop
  displayHabitsWithWhile() {
    displaySeparator(true);
    console.log('DEMO: MENAMPILKAN HABITS DENGAN WHILE LOOP');
    displaySeparator();

    if (this.habits.length === 0) {
      console.log('Tidak ada kebiasaan untuk ditampilkan.');
    } else {
      let i = 0;
      while (i < this.habits.length) {
        const habit = this.habits[i];
        console.log(`${i + 1}. ${habit.name} - ${habit.getStatus()}`);
        i++;
      }
    }

    displaySeparator(false, true);
  }

  // Demo menampilkan kebiasaan menggunakan for-loop
  displayHabitsWithFor() {
    displaySeparator(true);
    console.log('DEMO: MENAMPILKAN HABITS DENGAN FOR LOOP');
    displaySeparator();

    if (this.habits.length === 0) {
      console.log('Tidak ada kebiasaan untuk ditampilkan.');
    } else {
      for (let i = 0; i < this.habits.length; i++) {
        const habit = this.habits[i];
        console.log(`${i + 1}. ${habit.name} - ${habit.getStatus()}`);
      }
    }

    displaySeparator(false, true);
  }

  // Menampilkan statistik agregat menggunakan beragam metode array.
  displayStats() {
    userProfile.updateStats(this.habits);

    displaySeparator(true);
    console.log('STATISTIK KEBIASAAN');
    displaySeparator();

    const habitNames = this.habits.map((h) => h.name);
    console.log(`\nDaftar Habits: ${habitNames.join(', ') || 'Belum ada'}`);

    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());
    console.log(`Total Habits Aktif: ${activeHabits.length}`);

    const completedHabits = this.habits.filter((h) => h.isCompletedThisWeek());
    console.log(`Total Habits Selesai: ${completedHabits.length}`);

    let totalCompletions = 0;
    this.habits.forEach((habit) => {
      totalCompletions += habit.getThisWeekCompletions();
    });
    console.log(`Total Penyelesaian Minggu Ini: ${totalCompletions}`);

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

  // Mengaktifkan pengingat otomatis setiap REMINDER_INTERVAL milidetik.
  startReminder() {
    if (this.reminderInterval) {
      console.log('\nReminder sudah aktif.');
      return;
    }

    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);

    console.log('\nReminder diaktifkan. Akan muncul setiap 10 detik.');
  }

  // Menampilkan pengingat acak untuk kebiasaan yang belum diselesaikan hari ini.
  showReminder() {
    const today = new Date().toDateString();
    const incompleteToday = this.habits.filter((habit) => {
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

  // Menonaktifkan pengingat jika sedang aktif.
  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('\nReminder dinonaktifkan.');
    } else {
      console.log('\nReminder tidak aktif.');
    }
  }

  // Menyimpan userProfile dan daftar habits ke file JSON.
  saveToFile() {
    try {
      const data = {
        userProfile: userProfile,
        habits: this.habits,
      };

      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData, 'utf8');
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  }

  // Memuat data dari file JSON (jika ada) dan merestorasi state aplikasi.
  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(jsonData);

        Object.assign(userProfile, data.userProfile);

        this.habits = data.habits.map((habitData) => {
          // Gunakan nullish coalescing untuk menjaga default saat data tidak lengkap
          const name = habitData.name ?? 'Unnamed Habit';
          const freq = habitData.targetFrequency ?? 1;
          const category = habitData.category ?? 'Umum';
          const habit = new Habit(name, freq, category);
          // Pulihkan properti yang tersimpan (completions, streak, lastCompletionDate, createdAt, id)
          Object.assign(habit, habitData);
          return habit;
        });
      }
    } catch (error) {
      console.error('Error loading data:', error.message);
      this.habits = [];
    }
  }

  // Menghapus seluruh data habits dan mereset statistik profil.
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
        {
          let inputName = await askQuestion('Nama kebiasaan: ');
          inputName = (inputName || '').trim();
          if (!inputName) {
            console.log('\nNama kebiasaan tidak boleh kosong.');
            break;
          }
          const frequencyInput = await askQuestion('Target per minggu: ');
          let freqNum = parseInt(frequencyInput, 10);
          if (Number.isNaN(freqNum) || freqNum <= 0) {
            console.log(
              '\nTarget harus bilangan bulat positif. Menggunakan default 1.'
            );
            freqNum = 1;
          }
          tracker.addHabit(inputName, freqNum);
        }
        break;

      case '6':
        tracker.displayHabits('all');
        {
          const completeIndexInput = await askQuestion(
            'Nomor habit yang diselesaikan: '
          );
          const completeIndex = parseInt(completeIndexInput, 10);
          if (
            !Number.isInteger(completeIndex) ||
            completeIndex < 1 ||
            completeIndex > tracker.habits.length
          ) {
            console.log('\nNomor habit tidak valid.');
            break;
          }
          tracker.completeHabit(completeIndex);
        }
        break;

      case '7':
        tracker.displayHabits('all');
        {
          const deleteIndexInput = await askQuestion(
            'Nomor habit yang akan dihapus: '
          );
          const deleteIndex = parseInt(deleteIndexInput, 10);
          if (
            !Number.isInteger(deleteIndex) ||
            deleteIndex < 1 ||
            deleteIndex > tracker.habits.length
          ) {
            console.log('\nNomor habit tidak valid.');
            break;
          }
          tracker.deleteHabit(deleteIndex);
        }
        break;

      case '8':
        tracker.displayStats();
        break;

      case '9':
        tracker.displayHabitsWithWhile();
        tracker.displayHabitsWithFor();
        break;

      case '0':
        // Offer to export data before exit
        {
          const doExport = await askQuestion(
            'Ekspor data sebelum keluar? (y/n): '
          );
          if (doExport.toLowerCase() === 'y') {
            tracker.exportData();
          }
        }
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

main().catch((error) => {
  console.error('\nFatal Error:', error.message);
  rl.close();
  process.exit(1);
});
