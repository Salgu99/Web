let db;
document.addEventListener("DOMContentLoaded", () => {
    const request = indexedDB.open("myDB", 1);

  
    request.onerror = e => {
        alert("IndexedDB Error");
    }
  
    request.onsuccess = e => {
        db = e.target.result;
    }
  
    request.onupgradeneeded = e => {
        db = e.target.result;
  
        var objectStore = db.createObjectStore("Block", { keyPath: "id", autoIncrement:true });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("value", "value", { unique: false });
  
        objectStore.transaction.oncomplaete
    }
  });
  

function sendToIndexDB(type, texts){
    if (!texts)
        return;
    var objectStore = db.transaction("Block", "readwrite").objectStore("Block");
    
    const lines = texts.split("\n");
    const res = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
        if (type === "ip" || type === "unip") {
          // "아이피주소 (나라이름)" 형식의 문자열을 정규식으로 추출
          const match = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) \((.*)\)$/);
    
          if (match && match[2].includes("러시아")) {
            // 나라 이름이 "러시아"인 경우
            return { type: "rus", value: match[1].trim() };
          }else{
            return { type: type, value: match[1].trim() };
          }
        }else
            // 기존 로직에서와 동일하게 처리
            return { type: type, value: line.trim() };
      });
    
    res.forEach((item) => {
        if (item.value !== "") {
            // 공백이 아닌 경우에만 DB에 추가
            objectStore.add(item);
        }
    });
}

function getFromIndexDB(type){
    var objectStore = db.transaction("Block", 'readonly').objectStore("Block");
    var index = objectStore.index("type");

    var getReq = index.openCursor(IDBKeyRange.only(type));

    let docuIp = document.getElementById('ip');
    let docuRusip = document.getElementById('rusIp');
    let docuUnip = document.getElementById('unip')
    let docuUrl = document.getElementById('url');
    let docuUnurl = document.getElementById('unurl');

    let result = "";

    getReq.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            const tmp = cursor.value;
            console.log(tmp.value.toString());
            result += tmp.value.toString() + "\n";
            cursor.continue();
        } else {
            switch (type) {
                case "ip":
                    docuIp.value = result;
                    case "rus":
                        docuRusip.value = result;
                    break;
                case "unip":
                    docuUnip.value = result;
                    break;
                case "url":
                    docuUrl.value = result;
                    break;
                case "unurl":
                    docuUnurl.value = result;
                    break;
                default:
                    console.log("SWITCH ERROR");
                    break;
            }
        }
    }
}

function refresh() {
    var objectStore = db.transaction("Block", 'readonly').objectStore("Block");

    const ipTextarea = document.getElementById("ip");
    const rusIpTextarea = document.getElementById("rusIp");
    const unipTextarea = document.getElementById("unip");
    const urlTextarea = document.getElementById("url");
    const unurlTextarea = document.getElementById("unurl");

    ipTextarea.value = "";
    rusIpTextarea.value = "";
    unipTextarea.value = "";
    urlTextarea.value = "";
    unurlTextarea.value = "";

    objectStore.openCursor().onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const type = cursor.value.type;
        const value = cursor.value.value;
        if (type === "ip") {
          ipTextarea.value += value + "\n";
        } else if (type === "rus") {
          rusIpTextarea.value += value + "\n";
        } else if (type === "unip") {
          unipTextarea.value += value + "\n";
        } else if (type === "url") {
          urlTextarea.value += value + "\n";
        } else if (type === "unurl") {
          unurlTextarea.value += value + "\n";
        }
        cursor.continue();
      }
    };
  }
  
  function edit() {
    // TODO: Implement edit function
    console.log("Edit button clicked");
  }
  
  function reset() {
    const shouldClear = confirm("Are you sure you want to clear the database?");
    if (shouldClear) {
      const objectStore = db.transaction("Block", "readwrite").objectStore("Block");
      const request = objectStore.clear();
      request.onsuccess = function () {
        alert("Database cleared");
      };
    }
  }
  




  

const submitButton = document.getElementById("submit");
const clearButton = document.getElementById("clear");
const refreshButton = document.getElementById("refresh");
const editButton = document.getElementById("edit");
const resetButton = document.getElementById("reset");

submitButton.addEventListener("click", function(event) {
  event.preventDefault();
  
  const rawInput = document.getElementById("rawInput").value;
  const sections = rawInput.split("○ ");
  
  let ip = "";
  let unip = "";
  let url = "";
  let unurl = "";
  
  sections.forEach(function(section) {
    if (section.startsWith("출 발 지") || section.startsWith("차단 IP")) {
      ip += section.substring(5).trim() + "\n";
    }else if(section.startsWith("해제 IP")){
      unip += section.substring(6).trim();
    }else if (section.startsWith("차단 URL")) {
      url += section.substring(6).trim();
    } else if (section.startsWith("해제 URL")) {
      unurl += section.substring(6).trim();
    }
  });

  let docuRaw = document.getElementById('rawInput');

  sendToIndexDB("ip", ip.trim());
  sendToIndexDB("unip", unip);
  sendToIndexDB("url", url);
  sendToIndexDB("unurl", unurl);

  docuRaw.value = '';

  getFromIndexDB("ip");
  getFromIndexDB("rus")
  getFromIndexDB("unip");
  getFromIndexDB("url");
  getFromIndexDB("unurl");

});


clearButton.addEventListener('click', function(){
    document.getElementById('rawInput').value = '';
})

refreshButton.addEventListener('click', refresh);

editButton.addEventListener('click', edit);

resetButton.addEventListener('click', reset);
