export function copyValueToClipboard(val) {
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard 向剪贴板写文本
         navigator.clipboard.writeText(val).then(
            () => {
                alert('已复制，快去粘贴吧~')
            },
            () => {
                alert('有黑魔法，复制失败，尝试再次复制或者其他方式~')
            },
          );
          

    } else {
        // 创建text area
        const textArea = document.createElement('textarea')
        textArea.value = val
        // 使text area不在viewport，同时设置不可见
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        alert('已复制，快去粘贴吧~')
        new Promise((res, rej) => {
            // 执行复制命令并移除文本框
            document.execCommand('copy') ? res() : rej()
            textArea.remove()
        })
    }
}

