const mariadb = require('mariadb');

console.log('Connecting to DB with:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_DATABASE);

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10
});

// 연결 테스트 및 쿼리 실행
async function testConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('DB connected');
        // 간단한 쿼리 실행
        const rows = await conn.query("SELECT * FROM user LIMIT 5"); // 예시 쿼리
        console.log(rows); // 쿼리 결과 출력
        conn.release(); // 연결 사용 후 해제
    } catch (err) {
        console.error('DB connection failed: ', err);
    }
}

testConnection();

module.exports = pool; // pool을 내보내기
