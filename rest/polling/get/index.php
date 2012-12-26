<?php
/* 
* Get new messages
* Get all messages since last timestamp as json object
*
*
* @author
* @package com.zuizz.core
* @subpackage
*
*
*
* Permissions / Roles
* User => Auth users can poll
*
*
*
* States
*
* State 200  =>
* OK, data in Response Body
*
* State 204  =>
* No new messages since last timestamp, increase your interval time
*
*
*
* Available variables
*
* Get Messages in context.
* varname:context (string), always available:1
*
* Unix Timestamp
* varname:identifier (numeric), always available:1
*
*
*
*/


$context   = $this->values['context'];
$timestamp = $this->values['identifier'];

$this->data['timestamp'] = ZU_NOW;
$this->data['context'] = $context;
$this->data['memsize'] = $this->config['polling']['size'];


$shmid = shmop_open($this->config['polling']['systemid'], "c", 0755, $this->config['polling']['size']);

$read  = shmop_read($shmid, 0, 0);
$string = rtrim($read);
$this->data['memory_usage'] = intval( strlen($string) *  100 / $this->config['polling']['size'] );

$array =  json_decode($string);
if(is_array($array)){
rsort($array);
foreach ($array as $message) {

    if ($message->timestamp >= $timestamp) {
        if (isset($context) && $message->context == $context) {
            unset ($message->context);

        }
        $this->data['messages'][] = $message;
    } else {
        break;
    }
}
}
if ( isset( $this->data['messages']) ){
    ZU::header(200);
}  else{
    ZU::header(204);
}




// set default mimetype
if (!$this->mimetype) {
    $this->mimetype = 'json';
}

switch ($this->mimetype) {
    case "json":
        header('Content-type: application/json');
        $this->contentbuffer = json_encode($this->data);
        break;

}