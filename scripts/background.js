// This is how we get around CORS :P
chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
    // console.log(request)
    fetch("https://www.ratemyprofessors.com/graphql", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Basic dGVzdDp0ZXN0",
        "content-type": "application/json",
      },
      "body": JSON.stringify({
        "query": "query TeacherSearchResultsPageQuery(\n  $query: TeacherSearchQuery!\n  $schoolID: ID\n) {\n  search: newSearch {\n    ...TeacherSearchPagination_search_1ZLmLD\n  }\n  school: node(id: $schoolID) {\n    __typename\n    ... on School {\n      name\n    }\n    id\n  }\n}\n\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\n  teachers(query: $query, first: 8, after: \"\") {\n    didFallback\n    edges {\n      cursor\n      node {\n        ...TeacherCard_teacher\n        id\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    resultCount\n    filters {\n      field\n      options {\n        value\n        id\n      }\n    }\n  }\n}\n\nfragment TeacherCard_teacher on Teacher {\n  id\n  legacyId\n  avgRating\n  numRatings\n  ...CardFeedback_teacher\n  ...CardSchool_teacher\n  ...CardName_teacher\n  ...TeacherBookmark_teacher\n}\n\nfragment CardFeedback_teacher on Teacher {\n  wouldTakeAgainPercent\n  avgDifficulty\n}\n\nfragment CardSchool_teacher on Teacher {\n  department\n  school {\n    name\n    id\n  }\n}\n\nfragment CardName_teacher on Teacher {\n  firstName\n  lastName\n}\n\nfragment TeacherBookmark_teacher on Teacher {\n  id\n  isSaved\n}\n",
        "variables":{"query":{"text":request.name,"schoolID":request.location,"fallback":true,"departmentID":null},"schoolID":request.location}
      }),    
      "method": "POST",
    }).then(res => {
      // console.log(res)
      if (res.ok) {
        let json = res.json().then((json => callback(json))).catch(e => callback())
      } else {
        callback()
      }
    }).catch(e => {
      callback()
      // console.log(e)
    })
    return true
  }
);