const fs = require( "fs" );
const parseArgs = require( "mri" );
const sliceFile = require( "slice-file" );
const exec = require( "child_process" ).exec;
const path = require( "path" );
const iconv = require( "iconv-lite" );

const log = t => () => console.log( t );

function slicing( segment, lineCount, sliceable, firstLine, filePath ) {
    if ( segment < 0 ) return;
    if ( segment < 1 ) {
        let sections = [];
        for ( let i = 0, ss = Math.ceil( 1 / segment ); i < ss + 1; i++ ) {
            sections.push( Math.min( 1, i * segment ) );
        }
        for ( let j = 0; j < sections.length - 1; j++ ) {
            const t1 = Math.floor( lineCount * sections[ j ] );
            const t2 = Math.floor( lineCount * sections[ j + 1 ] );
            const p = path.resolve( `${filePath.dir}/${filePath.name}_part${j}${filePath.ext}` );
            console.log( `start slice, line: ${t1}-${t2}, path: ${p}` );
            const wf = fs.createWriteStream( p );
            // wf.on( "pipe", ( data ) => {
            //     console.log( "slice on data ", data + "" );
            // } );
            if ( j != 0 ) wf.write( firstLine );
            wf.on( "finish", log( `finish slice, line: ${t1}-${t2}, path: ${p}` ) );
            sliceable.slice( t1, t2 ).pipe( wf );
        }
    }
}

const flags = parseArgs( process.argv.slice( 2 ), { default: { segment: 0.5, encoding: "UTF8" }, alias: { s: "segment", e: "encoding" } } );
const file = flags._[ 0 ];

if ( flags.segment < 0 || flags.segment >= 1 ) {
    console.error( "flag segment(-s) => [0, 1)" );
    process.exit( 1 );
    return;
}

if ( file && fs.existsSync( file ) ) {
    exec( `cat ${file} | wc -l`, ( err, stdout, stderr ) => {
        if ( err == null ) {
            const lineCount = parseInt( stdout );
            const fileSliceable = sliceFile( file );
            let readBuffer = "";
            const readStream = fs.createReadStream( file );
            let onStream = readStream;
            if ( flags.encoding != "UTF8" ) {
                const convertStream = iconv.decodeStream( flags.encoding );
                onStream = convertStream;
                readStream.pipe( convertStream );
            }
            onStream.on( "data", ( data ) => {
                readBuffer += data;
                const lines = readBuffer.split( "\n" );
                if ( lines.length > 1 ) {
                    readStream.destroy();
                    const firstLine = lines[ 0 ] + "\n";
                    const encodedFirstLine = iconv.encode( firstLine, flags.encoding );
                    slicing( flags.segment, lineCount, fileSliceable, encodedFirstLine, path.parse( file ) );
                }
            } );
        }
    } );
}
