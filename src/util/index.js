'use strict';
const fs = require('fs');
const chalk = require(`chalk`)
/**
 * Create structure of markdown documentation
 * @param {object} docJson 
 * @return {strinf} structure of markdown
 */
function createStructureOfMarkdown(docJson){
    let markdown = ''

    markdown += `# ${docJson.info.name}\n`
    markdown += docJson.info.description !== undefined ? `${docJson.info.description || ''}\n` :`\n`
    markdown += readItems(docJson.item)

    return markdown
}

/**
 * Read auth of each method
 * @param {object} auth 
 */
function readAuthorization(auth){
    let markdown = ''
    if(auth){
        markdown += `### Authentication ${auth.type}\n`
        markdown += `\n`
        markdown += `|Param|value|Type|\n`
        markdown += `|---|---|---|\n`
        if(auth.bearer){
            auth.bearer.map(auth =>{
                markdown += `|${auth.key}|${auth.value}|${auth.type}|\n`
            })
        }
        markdown += `\n`
    }

    return markdown
}

/**
 * Read request of each method
 * @param {object} request information
 * @return {string} info of data about request options
 */
function readRequestOptions(request){
    let markdown = ''
    if(request){
            request.header.map(header =>{
            markdown += `### Headers\n`
            markdown += `\n`
            markdown += `|Content-Type|Value|\n`
            markdown += `|---|---|\n`
            markdown += `|${header.key}|${header.value}|\n`
            markdown += `\n`
        })
    }
    return markdown
}

function readQueryParams(url){
    let markdown = ''
    if(url?.query){
        markdown += `### Query Params\n`
        markdown += `\n`
        markdown += `|Param|value|\n`
        markdown += `|---|---|\n`
        url.query.map(query =>{
            markdown += `|${query.key}|${query.value}|\n`
        })
        markdown += `\n`
    }

    return markdown
}

/**
 * Read objects of each method
 * @param {object} body 
 */
function readFormDataBody(body) {
    let markdown = ''
    
    if(body){
        if(body.mode === 'raw'){
            markdown += `### Body (**${body.mode}**)\n`
            markdown += `{% highlight json %}\n`
            markdown += `${body.raw}\n`
            markdown += `{% endhighlight %}\n`
            markdown += `\n`
        }

        if(body.mode === 'formdata'){
            markdown += `### Body ${body.mode}\n`
            markdown += `\n`
            markdown += `|Param|value|Type|\n`
            markdown += `|---|---|---|\n`
            body.formdata.map(form =>{
                markdown += `|${form.key}|${form.type === 'file' ? form.src : form.value !== undefined ? form.value.replace(/\\n/g,'') : '' }|${form.type}|\n`
            })
            markdown += `\n`
        }
    }

    return markdown 
}

/**
 * Read methods of response
 * @param {array} responses 
 */
function readResponse(responses) {
    let markdown = ''
    if (responses?.length) {
        const response = responses[0];
        markdown += `### Response: ${response.code}\n`
        markdown += `{% highlight json %}\n`
        markdown += `${response.body}\n`
        markdown += `{% endhighlight %}\n`
        markdown += `\n`
    }
    return markdown;
}

/**
 * Read methods of each item
 * @param {object} post 
 */
function readMethods(method){
    let markdown = ''
    markdown += method?.request?.description !== undefined ? `${method?.request?.description || ''}\n\n` :`\n`
    markdown += `### Method: ${method?.request?.method}\n`
    markdown += `{% raw %}\n`
    markdown += `\t${method?.request?.url?.raw}\n`
    markdown += `{% endraw %}\n\n`
    markdown += readRequestOptions(method?.request)
    markdown += readFormDataBody(method?.request?.body)
    markdown += readQueryParams(method?.request?.url)
    markdown += readAuthorization(method?.request?.auth)
    markdown += readResponse(method?.response)
    markdown += `⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃\n`
    markdown += `\n`
    return markdown
}

/**
 * Read items of json postman
 * @param {Array} items
 */
function readItems(items, folderDeep = 1) {
    let markdown = ''
    items.forEach(item => { 
        markdown += `${'#'.repeat(folderDeep)} ${item.name} \n\n`
        markdown += item.description !== undefined ? `${item.description || ''}\n`: ``
        markdown += `\n`
        if (item.item) {
            markdown += readItems(item.item, folderDeep + 1)
        } else {
            markdown += readMethods(item)
        }
    })
    
    return markdown
}

/**
 * Create file
 * @param {string} content 
 */
function writeFile(content, fileName){
    fs.writeFile(`${fileName}.md`, content, function (err) {
        if (err) throw err;
        console.log(chalk.green(`Documentation was created correctly ${fileName}.md`))
    });
}

module.exports = {
    createStructureOfMarkdown,
    writeFile
}