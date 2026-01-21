const crypto = require('crypto');

// 사용자가 제공한 비밀번호와 저장된 해시된 비밀번호를 받습니다.
const userInputPassword = 'master';
var storedHashedPassword = 'b099607fbc409b1ea94bd46a193195b1c5cb91d1454a4365558465c84fd117c9';

// 사용자가 입력한 비밀번호를 해시화합니다.
const salt = '3448'; // 만약 사용했다면
const hashedUserInputPassword = crypto.createHash('sha256').update(salt + userInputPassword).digest('hex');

// 해시화된 비밀번호를 비교합니다.
if (hashedUserInputPassword === storedHashedPassword) {
    console.log('비밀번호가 일치합니다.');
} else {
    console.log('비밀번호가 일치하지 않습니다.');
}
