let tasks = {}

setInterval(() => {
  // Find expanded course descriptions
  let elems = document.querySelectorAll('[style="padding: 12px; border-radius: 4px; background: rgb(245, 246, 250);"]')
  for (let k = 0; k < elems.length; k++) {
    const element = elems[k];
    // Make sure we haven't already put a button
    if (!element.hasAttribute("x-seen")) {
      element.setAttribute("x-seen", "true")
      if (element.getElementsByTagName("dl").length == 1) {
        let lines = element.getElementsByTagName("dl")[0].children
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          // console.log(line)
          if (line.innerHTML.includes("mailto:") && !line.hasAttribute("x-seen")) {
            // console.log(line)
            // console.log(line.querySelector("div"))
            line.setAttribute("x-seen", "true")
            let new_element = line.querySelector("div").querySelector("dd").cloneNode(true);
            let uuid = crypto.randomUUID()
            new_element.innerHTML = `<button type="button" id="${uuid}" x-name="${line.querySelector("div").querySelector("dd").innerText}">Get Instructor Rating</button>`
            var curRow = line.parentNode;
            curRow.insertBefore(new_element, line.nextSibling);
            document.getElementById(uuid).addEventListener('click', getRating, false);
          }
        }
      }
    }
  }

  // Advanced class search page is slightly different
  elems = document.getElementsByClassName('MuiGrid-root position-relative MuiGrid-container MuiGrid-align-content-xs-flex-start')
  for (let k = 0; k < elems.length; k++) {
    const element = elems[k];
    // Make sure we haven't already put a button
    if (!element.hasAttribute("x-seen")) {
      element.setAttribute("x-seen", "true")
      let lines = element.children
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        //console.log(line)
        if (line.innerHTML.includes("mailto:") && !line.hasAttribute("x-seen")) {
          // console.log(line)
          // console.log(line.querySelector("div"))
          line.setAttribute("x-seen", "true")
          let new_element = line.cloneNode(true);
          let uuid = crypto.randomUUID()
          new_element.innerHTML = `<button type="button" id="${uuid}" x-name="${line.innerText}">Get Instructor Rating</button>`
          new_element.classList.add("MuiTypography-body1");
          new_element.classList.remove("MuiGrid-grid-xs-8");
          new_element.classList.add("MuiGrid-grid-xs-12");
          var curRow = line.parentNode;
          // console.log(new_element);
          curRow.insertBefore(new_element, line.nextSibling);
          document.getElementById(uuid).addEventListener('click', getRating, false);
        }
      }
    }
  }
}, 250);

function getRating(e) {
  // Instead of just changing the innerText of the button, I reset the innerHTML of the parent to clear the container
  e.srcElement.parentNode.innerHTML = `<button type="button" id="${e.srcElement.id}" x-name="${e.srcElement.getAttribute('x-name')}">Getting ratings...</button>`
  // Requests are sent to the background due to CORS
  let names = e.srcElement.getAttribute('x-name').split(", ")
  tasks[e.srcElement.id] = names.length
  names.forEach(name => {
    let query = {"name":name, "id":e.srcElement.id, "location": "U2Nob29sLTkyNw=="}
    chrome.runtime.sendMessage(query, res => handleResponse(res, query))
  });
}

function handleResponse(res, query) {
  // console.log(res)
  // console.log(query)
  let button = document.getElementById(query.id)
  let parent = button.parentNode
  tasks[query.id]--
  if(tasks[query.id] == 0) {
    button.innerText = "Get Instructor Rating"
    button.addEventListener('click', getRating, false);
  }
  if (res.status == "error") {
    var template = document.createElement('template');
    template.innerHTML = `<div><br>There was an error getting results for ${query.name}. (${res.message}) Please try again or <a href="https://www.ratemyprofessors.com/search/professors/927" target="_blank">click here to search manually.</a></div>`;
    return parent.append(template.content.firstChild)
  } else if (res.status == "no_results") {
    var template = document.createElement('template');
    template.innerHTML = `<div><br>No results for ${query.name}. <a href="https://www.ratemyprofessors.com/search/professors/927" target="_blank">Click here to search manually.</a></div>`;
    return parent.append(template.content.firstChild)
  } else if (res.status == "fallback") {
    var template = document.createElement('template');
    var templateContent = `<div><br>No results for ${query.name}, but here's other possible results.`;
    for (let i = 0; i < res.profs.length && i < 5; i++) {
      // console.log(res.profs[i])
      templateContent += `<br><a href="https://www.ratemyprofessors.com/professor/${res.profs[i].node.legacyId}" target="_blank"> • ${res.profs[i].node.firstName} ${res.profs[i].node.lastName} - ${res.profs[i].node.department} - ${res.profs[i].node.school.name}</a>`
    }
    templateContent += `</div>`;
    template.innerHTML = templateContent;
    // console.log(template)
    return parent.append(template.content.firstChild)
  }
  const data = res.data.data.node;
  // console.log(data)
  var template = document.createElement('template');
  template.innerHTML = `<div><br><a href="https://www.ratemyprofessors.com/professor/${data.legacyId}" target="_blank">${data.firstName} ${data.lastName} - ${data.department}</a><br>Rating: ${data.avgRating}/5<br>Difficulty: ${data.avgDifficulty}/5<br>Would Take Again: ${Math.round(data.wouldTakeAgainPercent)}%<br>Ratings: ${data.numRatings}</div>`
  return parent.append(template.content.firstChild)
}