// 千分符
str.toString().replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,')