module.exports.get404Page = (req,res) => {
    res.status(404).render('error/404', {title: 'Sayfa Bulunamadı!'});
}

module.exports.get500Page = (req,res) => {
    res.status(500).render('error/500', {title: 'HATA!!!'});
}